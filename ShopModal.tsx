import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, ExternalLink, Search } from 'lucide-react';
import { FurnitureItem } from '../types';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: FurnitureItem[];
  isLoading: boolean;
}

export default function ShopModal({ isOpen, onClose, items, isLoading }: ShopModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-sand flex justify-between items-center bg-sand/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-olive text-white rounded-full flex items-center justify-center">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h3 className="text-2xl font-serif">Shop the Look</h3>
                  <p className="text-xs text-charcoal/50">Curated items from your styled room</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-sand rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="w-12 h-12 border-4 border-olive/20 border-t-olive rounded-full animate-spin" />
                  <p className="text-charcoal/60 font-medium italic">Analyzing your room for furniture...</p>
                </div>
              ) : items.length > 0 ? (
                <div className="grid gap-4">
                  {items.map((item) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="group p-5 rounded-3xl border border-sand hover:border-olive/30 hover:bg-olive/5 transition-all flex flex-col gap-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-olive/60">{item.category}</span>
                          </div>
                          <h4 className="font-serif text-xl text-charcoal">{item.name}</h4>
                          <p className="text-sm text-charcoal/60">{item.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <a 
                          href={item.searchUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-olive transition-all active:scale-95"
                          title="Search on Google"
                        >
                          <Search size={14} />
                          <span>Google</span>
                        </a>
                        <a 
                          href={`https://www.amazon.com/s?k=${encodeURIComponent(item.name)}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-[#FF9900] text-black rounded-full text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all active:scale-95"
                        >
                          <span>Amazon</span>
                        </a>
                        <a 
                          href={`https://www.ikea.com/search/?q=${encodeURIComponent(item.name)}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-[#0058AB] text-[#FFCC00] rounded-full text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all active:scale-95"
                        >
                          <span>IKEA</span>
                        </a>
                        <a 
                          href={`https://www.wayfair.com/keyword.php?keyword=${encodeURIComponent(item.name)}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-[#7F187F] text-white rounded-full text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all active:scale-95"
                        >
                          <span>Wayfair</span>
                        </a>
                        <a 
                          href={`https://www.westelm.com/search/results.html?words=${encodeURIComponent(item.name)}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-[#2C2C2C] text-white rounded-full text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all active:scale-95"
                        >
                          <span>West Elm</span>
                        </a>
                        <a 
                          href={`https://www.potterybarn.com/search/results.html?words=${encodeURIComponent(item.name)}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-[#4A4A4A] text-white rounded-full text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all active:scale-95"
                        >
                          <span>Pottery Barn</span>
                        </a>
                        <a 
                          href={`https://shopee.com/search?keyword=${encodeURIComponent(item.name)}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-[#EE4D2D] text-white rounded-full text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all active:scale-95"
                        >
                          <span>Shopee</span>
                        </a>
                        <a 
                          href={`https://www.lazada.com.my/catalog/?q=${encodeURIComponent(item.name)}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-[#0F146D] text-white rounded-full text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all active:scale-95"
                        >
                          <span>Lazada</span>
                        </a>
                        <a 
                          href={`https://www.tiktok.com/search/product?q=${encodeURIComponent(item.name)}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all active:scale-95"
                        >
                          <span>TikTok</span>
                        </a>
                        <a 
                          href={`https://www.temu.com/search_result.html?search_key=${encodeURIComponent(item.name)}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-[#FB7701] text-white rounded-full text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all active:scale-95"
                        >
                          <span>Temu</span>
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 space-y-3">
                  <div className="w-16 h-16 bg-sand rounded-full flex items-center justify-center mx-auto text-charcoal/30">
                    <Search size={32} />
                  </div>
                  <p className="text-charcoal/50">We couldn't identify specific items in this style yet.</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-sand/5 text-center border-t border-sand">
              <p className="text-[10px] text-charcoal/40 uppercase tracking-widest">
                Links are generated based on visual similarity
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
