import { DESIGN_STYLES } from '../types';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

interface StyleSelectorProps {
  selectedStyle: string | null;
  onSelect: (styleId: string) => void;
}

export default function StyleSelector({ selectedStyle, onSelect }: StyleSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {DESIGN_STYLES.map((style) => (
        <motion.button
          key={style.id}
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(style.id)}
          className={`
            relative p-6 rounded-2xl text-left transition-all border
            ${selectedStyle === style.id 
              ? 'bg-olive text-white border-olive shadow-lg' 
              : 'bg-white text-charcoal border-sand hover:border-olive/30'}
          `}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-lg font-serif font-semibold">{style.name}</span>
            {selectedStyle === style.id && <Check size={18} />}
          </div>
          <p className={`text-xs leading-relaxed ${selectedStyle === style.id ? 'text-white/70' : 'text-charcoal/50'}`}>
            {style.description}
          </p>
        </motion.button>
      ))}
    </div>
  );
}
