import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { User } from 'firebase/auth';
import { doc, onSnapshot, collection, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { RoomProject, StyledImage, FurnitureItem } from '../types';
import CompareView from '../components/CompareView';
import ShopModal from '../components/ShopModal';
import { identifyFurniture } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Share2, Download, RefreshCw, Check, ShoppingBag } from 'lucide-react';

export default function Compare({ user }: { user: User }) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<RoomProject | null>(null);
  const [versions, setVersions] = useState<StyledImage[]>([]);
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(0);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isIdentifying, setIsIdentifying] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    const unsubscribe = onSnapshot(doc(db, 'projects', projectId), (snapshot) => {
      if (snapshot.exists()) {
        const data = { id: snapshot.id, ...snapshot.data() } as RoomProject;
        setProject(data);
      } else {
        navigate('/');
      }
    });

    const versionsUnsubscribe = onSnapshot(collection(db, 'projects', projectId, 'versions'), (snapshot) => {
      const v = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StyledImage[];
      const sorted = v.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setVersions(sorted);
      if (sorted.length > 0) {
        setSelectedVersionIndex(sorted.length - 1);
      }
    });

    return () => {
      unsubscribe();
      versionsUnsubscribe();
    };
  }, [projectId, navigate]);

  const handleShare = async () => {
    if (!project || versions.length === 0) return;
    try {
      await navigator.share({
        title: 'My Styled Room - Lumina AI',
        text: `Check out my room styled in ${versions[selectedVersionIndex].style}!`,
        url: window.location.href,
      });
    } catch (err) {
      // Fallback: copy link
      navigator.clipboard.writeText(window.location.href);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 3000);
    }
  };

  const handleDownload = () => {
    if (!project || versions.length === 0) return;
    const link = document.createElement('a');
    link.href = versions[selectedVersionIndex].url;
    link.download = `lumina-styled-${versions[selectedVersionIndex].style.toLowerCase()}.png`;
    link.click();
  };

  const handleShop = async () => {
    if (!project || versions.length === 0) return;
    
    const currentVersion = versions[selectedVersionIndex];
    setIsShopModalOpen(true);

    if (!currentVersion.furniture || currentVersion.furniture.length === 0) {
      setIsIdentifying(true);
      try {
        const items = await identifyFurniture(currentVersion.url);
        // Save to Firestore so we don't have to identify again
        await updateDoc(doc(db, 'projects', project.id, 'versions', currentVersion.id), {
          furniture: items
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `projects/${project.id}/versions/${currentVersion.id}`);
      } finally {
        setIsIdentifying(false);
      }
    }
  };

  if (!project || versions.length === 0) return null;

  const currentStyled = versions[selectedVersionIndex];

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-sand rounded-full transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h1 className="text-4xl font-serif">Compare <span className="italic">Results</span></h1>
            <p className="text-charcoal/50">Slide to see the transformation.</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={handleShop} 
            className="flex items-center gap-2 px-6 py-3 bg-olive text-white rounded-full font-medium hover:bg-olive/90 transition-all shadow-lg hover:scale-105 active:scale-95"
          >
            <ShoppingBag size={18} />
            <span>Shop the Look</span>
          </button>
          <button onClick={handleShare} className="btn-secondary flex items-center gap-2">
            <Share2 size={18} />
            <span>Share</span>
          </button>
          <button onClick={handleDownload} className="btn-secondary flex items-center gap-2">
            <Download size={18} />
            <span>Save</span>
          </button>
          <Link to={`/style/${project.id}`} className="btn-primary flex items-center gap-2">
            <RefreshCw size={18} />
            <span>Try Another Style</span>
          </Link>
        </div>
      </header>

      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="shadow-3xl border-[12px] border-white rounded-[40px] overflow-hidden"
        >
          <CompareView 
            original={project.originalImageUrl} 
            styled={currentStyled.url} 
          />
        </motion.div>

        <div className="flex flex-col items-center gap-6">
          <h3 className="font-serif text-2xl">Other Versions</h3>
          <div className="flex gap-4 p-4 bg-white rounded-3xl border border-sand overflow-x-auto max-w-full">
            {versions.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setSelectedVersionIndex(idx)}
                className={`
                  relative flex-shrink-0 w-24 aspect-square rounded-2xl overflow-hidden border-2 transition-all
                  ${selectedVersionIndex === idx ? 'border-olive scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}
                `}
              >
                <img src={img.url} alt={img.style} className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] py-1 text-center">
                  {img.style}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Copy Notification */}
      <ShopModal 
        isOpen={isShopModalOpen}
        onClose={() => setIsShopModalOpen(false)}
        items={currentStyled.furniture || []}
        isLoading={isIdentifying}
      />

      <AnimatePresence>
        {showCopyToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-charcoal text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl z-50"
          >
            <Check size={18} className="text-emerald-400" />
            <span className="text-sm font-medium">Link copied to clipboard!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
