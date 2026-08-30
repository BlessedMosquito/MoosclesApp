'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';
import { getLevelProgress, GetLevelProgressType } from '@/lib/helpers';
import { CompleteWorkoutResult, ExperienceBreakdownItem } from '@/services/workouts';
import { WorkoutTypeGroup } from '@/services/workoutTypes';
import Button from '../Button';
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

const ICONS: Record<ExperienceBreakdownItem['type'], string> = {
  workout: '🏋️',
  exercises: '📋',
  sets: '🔢',
  reps: '💪',
  duration: '⏱️',
  distance: '📏',
};

export default function ExperienceSummaryPopup({
  previousExp,
  result,
  workoutGroup,
  onClose,
}: ExperienceSummaryPopupProps) {
  const { isMobile, scale } = useResponsive();

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
    const t = setTimeout(
      () => setVisibleItems((v) => v + 1),
      350
    );
    return () => clearTimeout(t);
  }, [showBreakdown, visibleItems, filteredBreakdown.length]);

  const circleSize = s(isMobile ? 80 : 96, scale);
  const levelUp = newLevelData.level > oldLevelData.level;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        padding: s(20, scale),
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: s(24, scale),
          width: '100%',
          maxWidth: s(360, scale),
        }}
      >
        {/* level card */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: s(12, scale),
            width: '100%',
            background: colors.tileBg,
            border: `1px solid ${colors.border}`,
            borderRadius: s(20, scale),
            padding: s(24, scale),
          }}
        >
          {/* old → new level */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: s(16, scale),
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: s(fontSizes.caption, scale),
                  color: colors.textMuted,
                  fontWeight: 600,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.04em',
                }}
              >
                Before
              </span>
              <span
                style={{
                  fontSize: s(28, scale),
                  fontWeight: 800,
                  color: colors.textMuted,
                  lineHeight: 1.2,
                }}
              >
                {oldLevelData.level}
              </span>
            </div>

            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0, duration: 0.3 }}
              style={{
                fontSize: s(24, scale),
                color: colors.limeGreen,
              }}
            >
              →
            </motion.span>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: s(fontSizes.caption, scale),
                  color: colors.textMuted,
                  fontWeight: 600,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.04em',
                }}
              >
                After
              </span>
              <motion.span
                key={displayedLevel.level}
                initial={
                  levelUp ? { scale: 1.4, color: colors.limeGreen } : undefined
                }
                animate={{ scale: 1, color: colors.text }}
                transition={{ duration: 0.4 }}
                style={{
                  fontSize: s(28, scale),
                  fontWeight: 800,
                  lineHeight: 1.2,
                }}
              >
                {displayedLevel.level}
              </motion.span>
            </div>
          </div>

          {/* progress bar */}
          <div style={{ width: '85%' }}>
            <ProgressBar
              value={displayedLevel.currentExp}
              progress={displayedLevel.progress}
              color={colors.limeGreen}
              showLabels={false}
            />
          </div>

          <span
            style={{
              fontSize: s(fontSizes.caption, scale),
              color: colors.textMuted,
            }}
          >
            {displayedLevel.currentExp} / {displayedLevel.nextLevelExp} XP
          </span>
        </motion.div>

        {/* total xp earned */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          style={{
            fontSize: s(fontSizes.heading2, scale),
            fontWeight: 800,
            color: colors.limeGreen,
          }}
        >
          +{result.total_exp} XP
        </motion.div>

        {/* breakdown */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: s(8, scale),
            width: '100%',
          }}
        >
          <AnimatePresence>
            {filteredBreakdown.slice(0, visibleItems).map((item) => (
              <motion.div
                key={item.type}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: colors.tileBg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: s(14, scale),
                  padding: `${s(12, scale)}px ${s(16, scale)}px`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: s(10, scale),
                  }}
                >
                  <span style={{ fontSize: s(18, scale) }}>
                    {ICONS[item.type]}
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <span
                      style={{
                        fontSize: s(fontSizes.bodySmall, scale),
                        fontWeight: 600,
                        color: colors.text,
                      }}
                    >
                      {item.label}
                    </span>
                    {item.value !== undefined && (
                      <span
                        style={{
                          fontSize: s(fontSizes.caption, scale),
                          color: colors.textMuted,
                        }}
                      >
                        {item.value}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: s(fontSizes.body, scale),
                    fontWeight: 700,
                    color: colors.limeGreen,
                  }}
                >
                  +{item.amount}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* continue button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.4 }}
          style={{ width: '100%', marginTop: s(8, scale) }}
        >
          <Button onClick={onClose} width="full">
            Continue
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
