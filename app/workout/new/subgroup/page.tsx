'use client';

import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import ErrorPopUp from '@/components/ui/feedback/ErrorPopUp';
import Tile from '@/components/ui/tiles/Tile';
import { s, useResponsive } from '@/lib/useResponsive';
import { getWorkoutTypesSubGroups } from '@/services/workoutTypes';
import { useSetBackRoute, useSetText, useStartLeave } from '../layout';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SelectSubgroupPage() {
  const { isMobile, scale } = useResponsive();
  const router = useRouter();
  const setBackRoute = useSetBackRoute();
  const setText = useSetText();
  const startLeave = useStartLeave();

  const [subgroups, setSubgroups] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setBackRoute('/dashboard');
    setText('Choose type of your workout');
  }, [setBackRoute, setText]);

  async function loadSubgroups() {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getWorkoutTypesSubGroups();

      setSubgroups(data);
    } catch {
      setError('Could not load workout types.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSubgroups();
  }, []);

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: s(12, scale),
      }}
    >
      {error && <ErrorPopUp onClose={() => setError(null)}>{error}</ErrorPopUp>}

      {isLoading ? (
        <div
          style={{
            flex: 1,
            width: '100%',
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
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: s(12, scale),
          }}
        >
          {subgroups?.map((subgroup) => (
            <Tile
              key={subgroup}
              title={subgroup}
              titleVAlign="center"
              titleSize={isMobile ? 24 : 32}
              width="100%"
              height={100}
              onClick={() => {
                if (!isMobile) {
                  router.push(
                    `/workout/new/name?subgroup=${encodeURIComponent(subgroup)}`
                  );
                  return;
                }
                startLeave();
                setTimeout(() => {
                  router.push(
                    `/workout/new/name?subgroup=${encodeURIComponent(subgroup)}`
                  );
                }, 450);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
