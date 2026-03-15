import { useState, useEffect } from 'react';
import { RoomProject, StyledImage } from '../types';
import { motion } from 'motion/react';
import { Maximize2, Trash2, Plus, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

interface StyledImageCardProps {
  project: RoomProject;
  onDelete?: (projectId: string) => void;
}

export default function StyledImageCard({ project, onDelete }: StyledImageCardProps) {
  const [latestImage, setLatestImage] = useState<StyledImage | null>(null);
  const [versionCount, setVersionCount] = useState(0);

  useEffect(() => {
    const q = query(
      collection(db, 'projects', project.id, 'versions'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setLatestImage({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as StyledImage);
      }
    });

    const countUnsubscribe = onSnapshot(collection(db, 'projects', project.id, 'versions'), (snapshot) => {
      setVersionCount(snapshot.size);
    });

    return () => {
      unsubscribe();
      countUnsubscribe();
    };
  }, [project.id]);

  const displayImage = latestImage ? latestImage.url : project.originalImageUrl;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white rounded-3xl overflow-hidden border border-sand shadow-sm hover:shadow-xl transition-all duration-500"
    >
      <div className="aspect-[4/5] overflow-hidden relative">
        <img 
          src={displayImage} 
          alt="Room project" 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 gap-4">
          <div className="flex gap-2">
            <Link 
              to={`/style/${project.id}`}
              className="flex-1 bg-white text-charcoal py-2 rounded-full text-sm font-medium flex items-center justify-center gap-2 hover:bg-cream transition-colors"
            >
              <Plus size={16} />
              <span>Style More</span>
            </Link>
            <Link 
              to={`/compare/${project.id}`}
              className="w-10 h-10 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white/40 transition-colors"
              title="Compare"
            >
              <Maximize2 size={18} />
            </Link>
            {latestImage && (
              <Link 
                to={`/compare/${project.id}`}
                className="w-10 h-10 bg-olive text-white rounded-full flex items-center justify-center hover:bg-olive/80 transition-colors"
                title="Shop the Look"
              >
                <ShoppingBag size={18} />
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-serif text-xl font-semibold">
            {latestImage ? `${latestImage.style} Style` : 'Original Room'}
          </h3>
          <button 
            onClick={() => onDelete?.(project.id)}
            className="text-charcoal/20 hover:text-red-500 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
        <p className="text-xs text-charcoal/40">
          {new Date(project.createdAt?.seconds * 1000).toLocaleDateString()} • {versionCount} versions
        </p>
      </div>
    </motion.div>
  );
}
