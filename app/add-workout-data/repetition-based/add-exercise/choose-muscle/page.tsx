'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ErrorPopUp from '@/components/ui/feedback/ErrorPopUp';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import Tile from '@/components/ui/tiles/Tile';
import TopBar from '@/components/ui/topBar/TopBar';
import ChevronIcon from '@/components/icons/ChevronIcon';
import { s, useResponsive } from '@/lib/useResponsive';
import { getMuscles } from '@/services/exercisesList';
import { colors } from '@/theme/colors';
import { motion } from 'motion/react';

export default function ChooseMuscle() {
  const router = useRouter();
  const { isMobile, scale } = useResponsive();

  const [muscles, setMuscles] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getMuscles()
      .then((data) => {
        if (!cancelled) {
          setMuscles(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Could not load muscles.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function pickMuscle(muscle: string) {
    router.replace(
      `/add-workout-data/repetition-based/add-exercise?muscle=${encodeURIComponent(
        muscle
      )}`
    );
  }

  return (
    <main
      style={{
        background: 'transparent',
        padding: s(isMobile ? 18 : 28, scale),
        color: colors.text,
        height: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: isMobile ? '100%' : 760,
          height: '100%',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: s(16, scale),
        }}
      >
        <TopBar
          left={
            <button
              style={{ rotate: '-180deg', cursor: 'pointer' }}
              onClick={() =>
                router.replace(
                  '/add-workout-data/repetition-based/add-exercise'
                )
              }
            >
              <ChevronIcon />
            </button>
          }
          center="Choose muscle"
        />

        {error && (
          <ErrorPopUp onClose={() => setError(null)}>{error}</ErrorPopUp>
        )}

        {isLoading ? (
          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <LoadingCircle />
          </div>
        ) : (
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch',
              display: 'flex',
              flexDirection: 'column',
              gap: s(12, scale),
              paddingBottom: s(8, scale),
            }}
          >
            {muscles?.map((muscle) => (
              <motion.div
                key={muscle}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.4,
                  scale: { type: 'spring', visualDuration: 0.4, bounce: 0.3 },
                }}
              >
                <Tile
                  title={muscle}
                  titleVAlign="center"
                  titleSize={isMobile ? 24 : 32}
                  width="100%"
                  height={50}
                  onClick={() => pickMuscle(muscle)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
