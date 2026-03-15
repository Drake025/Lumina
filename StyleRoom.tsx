import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { User } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, collection, addDoc, serverTimestamp, deleteField } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { RoomProject, StyledImage, DESIGN_STYLES } from '../types';
import StyleSelector from '../components/StyleSelector';
import { generateStyledRoom } from '../services/geminiService';
import { compressImage } from '../utils/imageUtils';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Sparkles, Loader2, ArrowRight } from 'lucide-react';

export default function StyleRoom({ user }: { user: User }) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<RoomProject | null>(null);
  const [versions, setVersions] = useState<StyledImage[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    const unsubscribe = onSnapshot(doc(db, 'projects', projectId), (snapshot) => {
      if (snapshot.exists()) {
        setProject({ id: snapshot.id, ...snapshot.data() } as RoomProject);
      } else {
        navigate('/');
      }
    });

    const versionsUnsubscribe = onSnapshot(collection(db, 'projects', projectId, 'versions'), (snapshot) => {
      const v = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StyledImage[];
      setVersions(v.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    });

    return () => {
      unsubscribe();
      versionsUnsubscribe();
    };
  }, [projectId, navigate]);

  const handleGenerate = async () => {
    if (!project || !selectedStyle) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const styleName = DESIGN_STYLES.find(s => s.id === selectedStyle)?.name || selectedStyle;
      const rawStyledImageUrl = await generateStyledRoom(project.originalImageUrl, styleName);
      
      // Compress the generated image to stay under Firestore limits
      const styledImageUrl = await compressImage(rawStyledImageUrl);
      
      try {
        await addDoc(collection(db, 'projects', project.id, 'versions'), {
          url: styledImageUrl,
          style: styleName,
          createdAt: new Date().toISOString(),
        });
        
        // Clean up the old styledImages array if it exists to shrink the document
        await updateDoc(doc(db, 'projects', project.id), {
          updatedAt: serverTimestamp(),
          styledImages: deleteField(), 
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `projects/${project.id}/versions`);
      }

      navigate(`/compare/${project.id}`);
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err.message || "Failed to generate styled room. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!project) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <header className="flex items-center gap-4">
        <Link to="/" className="p-2 hover:bg-sand rounded-full transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <div>
          <h1 className="text-4xl font-serif">Style your <span className="italic text-olive">Space</span></h1>
          <p className="text-charcoal/50">Choose an aesthetic to transform your room.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="relative rounded-3xl overflow-hidden aspect-video shadow-2xl border-8 border-white">
            <img src={project.originalImageUrl} alt="Original" className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md text-white px-4 py-1 rounded-full text-xs font-medium">
              Original
            </div>
          </div>
          
          <div className="glass-card p-6">
            <h3 className="font-serif text-xl mb-4">Previous Versions</h3>
            {versions.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {versions.map((img) => (
                  <div key={img.id} className="flex-shrink-0 w-24 aspect-square rounded-xl overflow-hidden border border-sand">
                    <img src={img.url} alt={img.style} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-charcoal/40 italic">No styled versions yet.</p>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-serif">Select a Style</h2>
            <StyleSelector selectedStyle={selectedStyle} onSelect={setSelectedStyle} />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            disabled={!selectedStyle || isGenerating}
            onClick={handleGenerate}
            className="w-full btn-primary py-5 text-xl flex items-center justify-center gap-3"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" />
                <span>Generating Magic...</span>
              </>
            ) : (
              <>
                <Sparkles />
                <span>Transform Room</span>
              </>
            )}
          </button>
          
          <p className="text-center text-xs text-charcoal/30">
            Powered by Gemini AI • Takes about 10-20 seconds
          </p>
        </div>
      </div>
    </div>
  );
}
