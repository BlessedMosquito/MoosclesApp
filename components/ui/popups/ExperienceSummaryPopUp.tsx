'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getLevelProgress, GetLevelProgressType } from '@/lib/helpers';
import {
  CompleteWorkoutResult,
  ExperienceBreakdownItem,
} from '@/services/workouts';
import { WorkoutTypeGroup } from '@/services/workoutTypes';
import Button from '../buttons/Button';
import ProgressBar from '../ProgressBar';

type ExperienceSummaryPopupProps = {
  previousExp: number;
  result: CompleteWorkoutResult;
  workoutGroup: WorkoutTypeGroup;
  onClose: () => void;
};

const BREAKDOWN_TYPES_BY_GROUP: Record<
  WorkoutTypeGroup,
  ExperienceBreakdownItem['type'][]
> = {
  DurationOnly: ['workout', 'duration'],
  DistanceDuration: ['workout', 'duration', 'distance'],
  RepetitionBased: ['workout', 'sets', 'reps'],
};

export default function ExperienceSummaryPopup({
  previousExp,
  result,
  workoutGroup,
  onClose,
}: ExperienceSummaryPopupProps) {
  const allowedTypes = BREAKDOWN_TYPES_BY_GROUP[workoutGroup];
  const filteredBreakdown = result.breakdown.filter((item) =>
    allowedTypes.includes(item.type)
  );

  const oldLevelData = getLevelProgress(previousExp);
  const newLevelData = getLevelProgress(previousExp + result.total_exp);

  const [displayedLevel, setDisplayedLevel] =
    useState<GetLevelProgressType>(oldLevelData);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [visibleItems, setVisibleItems] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDisplayedLevel(newLevelData), 1200);
    return () => clearTimeout(t);
  }, [newLevelData]);

  useEffect(() => {
    const t = setTimeout(() => setShowBreakdown(true), 1800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!showBreakdown) return;
    if (visibleItems >= filteredBreakdown.length) return;
    const t = setTimeout(() => setVisibleItems((v) => v + 1), 350);
    return () => clearTimeout(t);
  }, [showBreakdown, visibleItems, filteredBreakdown.length]);

  const levelUp = newLevelData.level > oldLevelData.level;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="exp-overlay"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="exp-content"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="exp-level-card"
        >
          <div className="exp-levels">
            <div className="exp-level">
              <span className="exp-level-caption">Before</span>
              <span className="exp-level-value text-content-muted">
                {oldLevelData.level}
              </span>
            </div>

            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0, duration: 0.3 }}
              className="exp-arrow"
            >
              →
            </motion.span>

            <div className="exp-level">
              <span className="exp-level-caption">After</span>
              <motion.span
                key={displayedLevel.level}
                initial={levelUp ? { scale: 1.4 } : undefined}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4 }}
                className="exp-level-value"
              >
                {displayedLevel.level}
              </motion.span>
            </div>
          </div>

          <div className="w-[85%]">
            <ProgressBar
              value={displayedLevel.currentExp}
              progress={displayedLevel.progress}
            />
          </div>

          <span className="exp-caption">
            {displayedLevel.currentExp} / {displayedLevel.nextLevelExp} XP
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="exp-total"
        >
          +{result.total_exp} XP
        </motion.div>

        <div className="exp-breakdown">
          <AnimatePresence>
            {filteredBreakdown.slice(0, visibleItems).map((item) => (
              <motion.div
                key={item.type}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="exp-breakdown-item"
              >
                <div className="flex flex-col">
                  <span className="exp-breakdown-label">{item.label}</span>
                  {item.value !== undefined && (
                    <span className="exp-caption">{item.value}</span>
                  )}
                </div>
                <span className="exp-breakdown-amount">+{item.amount}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.4 }}
          className="mt-2 w-full"
        >
          <Button onClick={onClose} width="full">
            Continue
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
