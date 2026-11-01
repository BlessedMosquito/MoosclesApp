'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ErrorPopUp from '@/components/ui/feedback/ErrorPopUp';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import ChoiceTile from '@/components/ui/tiles/ChoiceTile';
import MuscleIcon from '@/components/muscles/MuscleIcon';
import TopBar from '@/components/ui/topBar/TopBar';
import BackButton from '@/components/ui/buttons/BackButton';
import { getMuscles } from '@/services/exercisesList';

export default function ChooseMuscle() {
  const router = useRouter();

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
    <main className="page page-padded page-fill">
      <div className="page-content page-content-wide page-fill-content">
        <TopBar
          left={
            <BackButton
              onClick={() =>
                router.replace(
                  '/add-workout-data/repetition-based/add-exercise'
                )
              }
            />
          }
          center="Choose muscle"
        />

        {error && (
          <ErrorPopUp onClose={() => setError(null)}>{error}</ErrorPopUp>
        )}

        {isLoading ? (
          <div className="content-center">
            <LoadingCircle />
          </div>
        ) : (
          <div className="muscle-list">
            <div className="choice-grid">
              {muscles?.map((muscle, index) => (
                <ChoiceTile
                  key={muscle}
                  media={<MuscleIcon muscle={muscle} />}
                  label={muscle}
                  index={index}
                  onClick={() => pickMuscle(muscle)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
