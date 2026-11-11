'use client';

import { Icon } from '@tabler/icons-react';
import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { press, PRESS_SCALE, spring } from '@/lib/motion';
import { cn } from '@/lib/utils';

type ChoiceTileProps = {
  icon?: Icon;
  media?: ReactNode;
  label: string;
  onClick: () => void;
  index?: number;
  selected?: boolean;
};

export default function ChoiceTile({
  icon: TileIcon,
  media,
  label,
  onClick,
  index = 0,
  selected,
}: ChoiceTileProps) {
  return (
    <motion.button
      type="button"
      role={selected === undefined ? undefined : 'radio'}
      aria-checked={selected}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: PRESS_SCALE, transition: press }}
      transition={{ ...spring, delay: index * 0.04 }}
      onClick={onClick}
      className={cn('choice-tile', selected && 'choice-tile-active')}
    >
      {media ??
        (TileIcon && (
          <span className="choice-tile-icon">
            <TileIcon size={26} stroke={1.75} />
          </span>
        ))}
      <span className="choice-tile-label">{label}</span>
    </motion.button>
  );
}
