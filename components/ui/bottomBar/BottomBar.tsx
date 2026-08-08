import { colors } from '@/theme/colors';
import { motion } from 'framer-motion';

export default function BottomBar({ children }: { children: React.ReactNode }) {
  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',

        display: 'flex',
        gap: 8,

        padding: 10,
        borderRadius: 999,
        background: 'rgba(0,0,0,0.3)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
    >
      {children}
    </nav>
  );
}
