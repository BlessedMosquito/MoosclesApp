'use client';

import { useEffect } from 'react';
import { motion } from 'motion/react';
import {
  IconAlertTriangle,
  IconHelpCircle,
  IconTrash,
} from '@tabler/icons-react';
import { fade, spring } from '@/lib/motion';
import { cn } from '@/lib/utils';
import Button from '../buttons/Button';

type QuestionPopUpProps = {
  text: string;
  onYes: () => void;
  onNo: () => void;
  title?: string;
  warning?: string;
  yesLabel?: string;
  noLabel?: string;
  tone?: 'default' | 'danger';
};

export default function QuestionPopUp({
  text,
  onYes,
  onNo,
  title,
  warning,
  yesLabel = 'Yes',
  noLabel = 'No',
  tone = 'default',
}: QuestionPopUpProps) {
  const isDanger = tone === 'danger';
  const Icon = isDanger ? IconTrash : IconHelpCircle;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      onNo();
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onNo]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={fade}
      onClick={onNo}
      className="overlay overlay-soft"
    >
      <motion.div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={title ? 'question-title' : undefined}
        aria-describedby="question-text"
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={spring}
        onClick={(e) => e.stopPropagation()}
        className="popup-card question-card"
      >
        <span
          className={cn('question-icon', isDanger && 'question-icon-danger')}
        >
          <Icon size={24} stroke={1.75} />
        </span>

        <div className="question-copy">
          {title && (
            <p id="question-title" className="question-title">
              {title}
            </p>
          )}
          <p id="question-text" className="question-text">
            {text}
          </p>
        </div>

        {warning && (
          <div role="alert" className="question-warning">
            <IconAlertTriangle size={18} stroke={2} className="shrink-0" />
            <span>{warning}</span>
          </div>
        )}

        <div className="question-actions">
          <Button variant="secondary" onClick={onNo}>
            {noLabel}
          </Button>
          <Button variant={isDanger ? 'danger' : 'primary'} onClick={onYes}>
            {yesLabel}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
