import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { compressImage } from '../utils/imageUtils';

interface RoomUploaderProps {
  onUpload: (base64: string) => void;
}

export default function RoomUploader({ onUpload }: RoomUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const compressed = await compressImage(base64);
        setPreview(compressed);
        onUpload(compressed);
      };
      reader.readAsDataURL(file);
    }
  }, [onUpload]);

  const dropzoneOptions: any = {
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneOptions);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            {...getRootProps()}
            className={`
              relative cursor-pointer group
              border-2 border-dashed rounded-3xl p-12
              flex flex-col items-center justify-center gap-4
              transition-all duration-300
              ${isDragActive ? 'border-olive bg-olive/5' : 'border-sand hover:border-olive/50 hover:bg-sand/30'}
            `}
          >
            <input {...getInputProps()} />
            <div className="w-16 h-16 bg-sand rounded-full flex items-center justify-center text-olive group-hover:scale-110 transition-transform">
              <Upload size={32} />
            </div>
            <div className="text-center">
              <p className="text-xl font-serif font-medium mb-1">Upload your room photo</p>
              <p className="text-charcoal/50">Drag and drop or click to browse</p>
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-4 text-xs text-charcoal/40">
              <span className="flex items-center gap-1"><ImageIcon size={12} /> High quality recommended</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-3xl overflow-hidden aspect-video bg-sand group"
          >
            <img src={preview} alt="Room preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                onClick={() => setPreview(null)}
                className="bg-white text-charcoal p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
              >
                <X size={24} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
