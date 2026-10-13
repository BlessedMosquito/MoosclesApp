'use client';

import Button from '@/components/ui/buttons/Button';
import TextInput from '@/components/ui/inputs/TextInput';
import { s, useResponsive } from '@/lib/useResponsive';
import { useSetBackRoute, useSetText, useStartLeave } from '../layout';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import ErrorPopUp from '@/components/ui/feedback/ErrorPopUp';

function NameContent() {
  const { isMobile, scale } = useResponsive();
  const router = useRouter();
  const searchParams = useSearchParams();
  const subgroup = searchParams.get('subgroup') ?? '';
  const setBackRoute = useSetBackRoute();
  const setText = useSetText();
  const startLeave = useStartLeave();
  const [workoutName, setWorkoutName] = useState<string>(
    searchParams.get('workoutName') ?? ''
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setBackRoute('/workout/new/subgroup');
    setText('Name your workout');
  }, [setBackRoute, setText]);

  const handleContinue = () => {
    if (!checkName()) {
      return;
    }
    const target = `/workout/new/type?subgroup=${encodeURIComponent(
      subgroup
    )}&workoutName=${encodeURIComponent(workoutName)}`;
    if (!isMobile) {
      router.push(target);
      return;
    }
    startLeave();
    setTimeout(() => {
      router.push(target);
    }, 450);
  };

  function checkName() {
    const name = workoutName.trim();

    if (!name) {
      setError('Name cannot be empty');
      return false;
    }

    if (!/^[\p{L}\p{N}]/u.test(name)) {
      setError('Name cannot start with a special character');
      return false;
    }

    setError('');
    return true;
  }

  return (
    <div
      style={{
        width: '100%',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: isMobile ? '100%' : 420,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: s(32, scale),
        }}
      >
        {error && (
          <ErrorPopUp onClose={() => setError(null)}>{error}</ErrorPopUp>
        )}
<TextInput
          placeholder="eg. Push day"
          value={workoutName}
          onChange={setWorkoutName}
        />

        <Button onClick={handleContinue} width="full">
          Continue
        </Button>
      </div>
    </div>
  );
}

export default function NamePage() {
  return (
    <Suspense fallback={null}>
      <NameContent />
    </Suspense>
  );
}
