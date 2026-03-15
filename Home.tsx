import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { RoomProject } from '../types';
import RoomUploader from '../components/RoomUploader';
import StyledImageCard from '../components/StyledImageCard';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Plus, Sparkles, AlertCircle, Trash2, X } from 'lucide-react';

export default function Home({ user }: { user: User }) {
  const [projects, setProjects] = useState<RoomProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(
      collection(db, 'projects'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RoomProject[];
      setProjects(projs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching projects:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [user.uid]);

  const handleUpload = async (base64: string) => {
    setUploadError(null);

    try {
      const docRef = await addDoc(collection(db, 'projects'), {
        userId: user.uid,
        originalImageUrl: base64,
        createdAt: serverTimestamp(),
      });
      navigate(`/style/${docRef.id}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'projects');
    }
  };

  const handleDelete = async (projectId: string) => {
    setProjectToDelete(projectId);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      await deleteDoc(doc(db, 'projects', projectToDelete));
      setProjectToDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `projects/${projectToDelete}`);
    }
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-5xl font-serif mb-2"
          >
            Your <span className="italic">Collection</span>
          </motion.h1>
          <p className="text-charcoal/50">Manage and reimagine your living spaces.</p>
        </div>
        
        <button 
          onClick={() => setShowUploader(!showUploader)}
          className="btn-primary flex items-center gap-2"
        >
          {showUploader ? <Plus className="rotate-45" /> : <Plus />}
          <span>{showUploader ? 'Close' : 'New Project'}</span>
        </button>
      </header>

      <AnimatePresence>
        {uploadError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3"
          >
            <AlertCircle size={20} />
            <p className="text-sm flex-1">{uploadError}</p>
            <button onClick={() => setUploadError(null)} className="p-1 hover:bg-red-100 rounded-full transition-colors">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUploader && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-sand/30 rounded-3xl p-8 mb-12">
              <RoomUploader onUpload={handleUpload} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="aspect-[4/5] bg-sand/50 animate-pulse rounded-3xl" />
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div key={project.id}>
              <StyledImageCard 
                project={project} 
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center glass-card p-12">
          <div className="w-20 h-20 bg-sand rounded-full flex items-center justify-center text-olive mb-6">
            <Sparkles size={40} />
          </div>
          <h2 className="text-3xl font-serif mb-4">No projects yet</h2>
          <p className="text-charcoal/50 max-w-md mb-8">
            Start by uploading a photo of your room. Our AI will help you visualize it in different styles.
          </p>
          {!showUploader && (
            <button onClick={() => setShowUploader(true)} className="btn-primary">
              Upload First Photo
            </button>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {projectToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl"
            >
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                <Trash2 size={24} />
              </div>
              <h3 className="text-2xl font-serif mb-2">Delete Project?</h3>
              <p className="text-charcoal/50 mb-8 text-sm">
                This action cannot be undone. All styled versions of this room will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setProjectToDelete(null)}
                  className="flex-1 py-3 rounded-full border border-sand font-medium hover:bg-sand/30 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3 rounded-full bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
