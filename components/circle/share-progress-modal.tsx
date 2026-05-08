'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Gift, Share2, Trophy, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ShareProgressModalProps = {
  open: boolean;
  streak: number;
  points: number;
  rank: number;
  clubTitle: string;
  referralBonusClaimed: boolean;
  onClose: () => void;
  onShare: () => void;
};

export function ShareProgressModal({ open, streak, points, rank, clubTitle, referralBonusClaimed, onClose, onShare }: ShareProgressModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/75 px-3 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button aria-label="Закрыть share modal" className="absolute inset-0" onClick={onClose} />
          <motion.div className="relative mb-3 w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 p-4 shadow-2xl shadow-emerald-950/40" initial={{ y: 420, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 420, scale: 0.98 }} transition={{ type: 'spring', damping: 28, stiffness: 260 }}>
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/20" />
            <button onClick={onClose} className="absolute right-4 top-4 rounded-full bg-white/10 p-2 active:scale-95"><X size={18} /></button>

            <div className="rounded-[1.75rem] border border-emerald-300/20 bg-gradient-to-br from-emerald-300/20 via-cyan-300/10 to-violet-400/10 p-5 shadow-[0_0_44px_rgba(52,211,153,0.12)]">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">Circle progress</p>
              <h3 className="mt-3 text-3xl font-black">Поделиться прогрессом</h3>
              <p className="mt-2 text-sm text-muted-foreground">Твой check-in засчитан. Покажи streak и позови друзей в клуб.</p>

              <div className="mt-5 grid grid-cols-3 gap-2">
                <ShareMetric icon={<Zap size={18} />} label="Streak" value={`${streak} 🔥`} />
                <ShareMetric icon={<Trophy size={18} />} label="Rank" value={`#${rank}`} />
                <ShareMetric icon={<Gift size={18} />} label="Points" value={`+${points}`} />
              </div>

              <div className="mt-5 rounded-3xl bg-slate-950/55 p-4 text-left text-sm leading-relaxed">
                <p>🔥 Я держу streak уже {streak} дней в Circle</p>
                <p className="mt-3">🚶 Сегодня:</p>
                <p className="font-black">{clubTitle}</p>
                <p className="mt-3">🏆 Место в клубе: #{rank}</p>
                <p className="mt-3 text-emerald-300">Присоединяйся: @circle_habits_bot</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <Button onClick={onShare} className="w-full"><Share2 className="mr-2" size={18} />Позвать друзей</Button>
              <p className="text-center text-xs text-muted-foreground">{referralBonusClaimed ? 'Referral badge получен · бонус +50 points уже начислен' : 'За приглашение друга: +50 points и Referral badge'}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ShareMetric({ icon, label, value }: { icon: JSX.Element; label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white/[0.06] p-3 text-center">
      <div className="mx-auto mb-2 w-fit text-emerald-300">{icon}</div>
      <p className="text-lg font-black">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
