import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { auth } from './firebase';
import { LogIn, LogOut, Home as HomeIcon, Image as ImageIcon, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Pages (will create these next)
import HomePage from './pages/Home';
import StyleRoomPage from './pages/StyleRoom';
import ComparePage from './pages/Compare';
import ErrorBoundary from './components/ErrorBoundary';

function Navbar({ user }: { user: User | null }) {
  const handleLogin = () => signInWithPopup(auth, new GoogleAuthProvider());
  const handleLogout = () => signOut(auth);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center bg-cream/80 backdrop-blur-md border-b border-sand">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-olive rounded-full flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white rounded-sm rotate-45" />
        </div>
        <span className="text-2xl font-serif font-semibold tracking-tight">Lumina</span>
      </Link>

      <div className="flex items-center gap-6">
        {user ? (
          <>
            <Link to="/" className="text-sm font-medium hover:text-olive transition-colors">Gallery</Link>
            <div className="flex items-center gap-3 pl-6 border-l border-sand">
              <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-sand" />
              <button onClick={handleLogout} className="p-2 hover:bg-sand rounded-full transition-colors text-charcoal/60">
                <LogOut size={18} />
              </button>
            </div>
          </>
        ) : (
          <button onClick={handleLogin} className="btn-primary flex items-center gap-2 py-2">
            <LogIn size={18} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-cream">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-3xl font-serif italic text-olive"
        >
          Lumina
        </motion.div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <Navbar user={user} />
        
        <main>
          {!user ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-6xl md:text-8xl font-serif mb-6 leading-tight"
              >
                Reimagine your <br />
                <span className="italic text-olive">living space.</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-charcoal/60 max-w-2xl mb-12"
              >
                Upload a photo of your room and let our AI transform it into any interior design style you desire.
              </motion.p>
              <motion.button 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => signInWithPopup(auth, new GoogleAuthProvider())}
                className="btn-primary text-lg px-12 py-4"
              >
                Get Started
              </motion.button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<HomePage user={user} />} />
                  <Route path="/style/:projectId" element={<StyleRoomPage user={user} />} />
                  <Route path="/compare/:projectId" element={<ComparePage user={user} />} />
                </Routes>
              </ErrorBoundary>
            </AnimatePresence>
          )}
        </main>
      </div>
    </Router>
  );
}
