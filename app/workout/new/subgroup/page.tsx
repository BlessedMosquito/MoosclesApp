'use client';

import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import ErrorPopUp from '@/components/ui/feedback/ErrorPopUp';
import ChoiceTile from '@/components/ui/tiles/ChoiceTile';
import { getWorkoutTypeIcon } from '@/lib/workoutTypeIcon';
import { useResponsive } from '@/lib/useResponsive';
import { getWorkoutTypesSubGroups } from '@/services/workoutTypes';
import { useSetBackRoute, useSetText, useStartLeave } from '../layout';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SelectSubgroupPage() {
  const { isMobile } = useResponsive();
  const router = useRouter();
  const setBackRoute = useSetBackRoute();
  const setText = useSetText();
  const startLeave = useStartLeave();

  const [subgroups, setSubgroups] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setBackRoute('/workout/create');
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

  function openSubgroup(subgroup: string) {
    const target = `/workout/new/name?subgroup=${encodeURIComponent(subgroup)}`;

    if (!isMobile) {
      router.push(target);
      return;
    }

    startLeave();
    setTimeout(() => {
      router.push(target);
    }, 450);
  }

  return (
    <div className="wizard-list">
      {error && <ErrorPopUp onClose={() => setError(null)}>{error}</ErrorPopUp>}

      {isLoading ? (
        <div className="content-center">
          <LoadingCircle />
        </div>
      ) : (
        <div className="choice-grid">
          {subgroups?.map((subgroup, index) => (
            <ChoiceTile
              key={subgroup}
              icon={getWorkoutTypeIcon(subgroup)}
              label={subgroup}
              index={index}
              onClick={() => openSubgroup(subgroup)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
