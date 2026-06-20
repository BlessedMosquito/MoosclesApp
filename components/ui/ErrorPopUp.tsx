import { useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';
import { motion } from 'motion/react';
import { s } from '@/lib/useResponsive';
import { useState } from 'react';

export default function ErrorPopUp({
  children,
}: {
  children: React.ReactNode;
}) {
  const { scale } = useResponsive();
  const [showContent, setShowContent] = useState(false);

  return (
    <motion.div
      role="alert"
      initial={{
        opacity: 1,
        scaleX: 0,
        scaleY: 0.1, // cienka kreska
      }}
      animate={{
        scaleX: 1,
        scaleY: 1,
      }}
      transition={{
        scaleX: {
          duration: 0.3,
          ease: 'easeOut',
        },
        scaleY: {
          duration: 0.2,
          delay: 0.3, // najpierw poziom, potem pion
          ease: 'easeOut',
        },
        opacity: {
          duration: 0.1,
        },
      }}
      onAnimationComplete={() => {
        setShowContent(true);
      }}
      style={{
        marginTop: s(18, scale),
        padding: s(12, scale),

        borderRadius: s(12, scale),
        border: `1px solid ${colors.errorBorder}`,
        background: colors.errorSurface,
        color: colors.errorMuted,
        fontSize: s(fontSizes.bodySmall, scale),

        transformOrigin: 'center',
        overflow: 'hidden',
        minHeight: s(48, scale),
      }}
    >
      {showContent && children}
    </motion.div>
  );
}
