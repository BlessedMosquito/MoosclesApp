'use client';

import Button from '@/components/ui/buttons/Button';
import TextInput from '@/components/ui/inputs/TextInput';
import { useResponsive } from '@/lib/useResponsive';
import { useSetBackRoute, useSetText, useStartLeave } from '../layout';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import ErrorPopUp from '@/components/ui/feedback/ErrorPopUp';

function NameContent() {
  const { isMobile } = useResponsive();
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

    setError(null);
    return true;
  }

  return (
    <div className="wizard-step">
      <div className="wizard-form wizard-form-loose">
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
