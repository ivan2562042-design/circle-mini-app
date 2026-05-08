'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ImagePlus, Loader2, Trash2, UploadCloud, X } from 'lucide-react';
import Image from 'next/image';
import { ChangeEvent, DragEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

type CheckInModalProps = {
  open: boolean;
  clubTitle: string;
  submitting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (image: string, note: string) => Promise<void>;
};

export function CheckInModal({ open, clubTitle, submitting, error, onClose, onSubmit }: CheckInModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState('');
  const [note, setNote] = useState('');
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!open) {
      setImage((currentImage) => {
        if (currentImage.startsWith('blob:')) URL.revokeObjectURL(currentImage);
        return '';
      });
      setNote('');
      setDragging(false);
    }
  }, [open]);

  const loadFile = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (image.startsWith('blob:')) URL.revokeObjectURL(image);
    setImage(URL.createObjectURL(file));
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => loadFile(event.target.files?.[0]);

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    loadFile(event.dataTransfer.files?.[0]);
  };

  const removeImage = () => {
    if (image.startsWith('blob:')) URL.revokeObjectURL(image);
    setImage('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!image || submitting) return;
    await onSubmit(image, note.trim() || `Check-in: ${clubTitle}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 px-3 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button aria-label="Закрыть check-in" className="absolute inset-0" onClick={onClose} />
          <motion.form onSubmit={submit} className="relative mb-3 w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-950 p-4 shadow-2xl shadow-emerald-950/40" initial={{ y: 420, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 420, scale: 0.98 }} transition={{ type: 'spring', damping: 28, stiffness: 260 }}>
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/20" />
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">Daily proof</p>
                <h3 className="mt-1 text-2xl font-black">Check-in сегодня</h3>
                <p className="mt-1 text-sm text-muted-foreground">{clubTitle}</p>
              </div>
              <button type="button" onClick={onClose} className="rounded-full bg-white/10 p-2 active:scale-95"><X size={18} /></button>
            </div>

            {!image ? (
              <label onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={handleDrop} className={`flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border border-dashed p-5 text-center transition ${dragging ? 'border-emerald-300 bg-emerald-300/10' : 'border-white/15 bg-white/[0.03]'}`}>
                <UploadCloud className="mb-3 text-emerald-300" size={42} />
                <span className="text-base font-black">Upload image</span>
                <span className="mt-2 max-w-56 text-sm text-muted-foreground">Выбери изображение с устройства или перетащи его сюда</span>
                <input ref={inputRef} type="file" accept="image/*" capture="environment" className="sr-only" onChange={handleInput} />
              </label>
            ) : (
              <div className="space-y-3">
                <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.03]">
                  <div className="relative h-72 w-full">
                    <Image src={image} alt="Check-in preview" fill unoptimized className="object-cover" />
                  </div>
                  <div className="absolute right-3 top-3 flex gap-2">
                    <button type="button" onClick={() => inputRef.current?.click()} className="rounded-full bg-slate-950/80 p-2 backdrop-blur active:scale-95"><ImagePlus size={18} /></button>
                    <button type="button" onClick={removeImage} className="rounded-full bg-red-500/90 p-2 text-white backdrop-blur active:scale-95"><Trash2 size={18} /></button>
                  </div>
                </div>
                <input ref={inputRef} type="file" accept="image/*" capture="environment" className="sr-only" onChange={handleInput} />
              </div>
            )}

            <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Напиши короткий комментарий" className="mt-4 min-h-28 w-full resize-none rounded-3xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-emerald-300/50" />
            {error && <p className="mt-3 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
            <Button type="submit" disabled={!image || submitting} className="mt-4 w-full">
              {submitting && <Loader2 className="mr-2 animate-spin" size={18} />}
              Подтвердить check-in
            </Button>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
