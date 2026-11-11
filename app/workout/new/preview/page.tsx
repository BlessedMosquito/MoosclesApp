'use client';

import QuestionPopUp from '@/components/ui/popups/QuestionPopUp';
import Button from '@/components/ui/buttons/Button';
import ErrorPopUp from '@/components/ui/feedback/ErrorPopUp';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import SuccessAnimation from '@/components/ui/feedback/SuccessAnimation';
import TextInput from '@/components/ui/inputs/TextInput';
import { createClient } from '@/lib/supabase/client';
import { useResponsive } from '@/lib/useResponsive';
import { Mode } from '@/types/common';
import { createWorkout } from '@/services/workouts';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useSetBackRoute, useSetText, useStartLeave } from '../layout';
import { motion } from 'motion/react';

function PreviewContent() {
  const { isMobile } = useResponsive();
  const router = useRouter();
  const searchParams = useSearchParams();
  const setBackRoute = useSetBackRoute();
  const setText = useSetText();
  const startLeave = useStartLeave();

  const subgroup = searchParams.get('subgroup') ?? '';
  const workoutNameInit = searchParams.get('workoutName') ?? '';
  const typeLabelInit = searchParams.get('typeLabel') ?? '';

  const name = workoutNameInit;
  const typeId = searchParams.get('typeId') ?? '';

  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showCancelPopUp, setShowCancelPopUp] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const pendingNavRef = useRef<string | null>(null);

  useEffect(() => {
    setBackRoute('/workout/new/type');
    setText('Your workout');
  }, [setBackRoute, setText]);

  function checkName(value: string) {
    const trimmed = value.trim();

    if (!trimmed) {
      setError('Name cannot be empty');
      return false;
    }

    if (!/^[\p{L}\p{N}]/u.test(trimmed)) {
      setError('Name cannot start with a special character');
      return false;
    }

    setError(null);
    return true;
  }

  const navigate = (target: string, replace = false) => {
    const go = () => (replace ? router.replace(target) : router.push(target));
    if (!isMobile) {
      go();
      return;
    }
    startLeave();
    setTimeout(go, 450);
  };

  const handleCreate = async () => {
    if (!checkName(name)) {
      return;
    }

    if (!typeId) {
      setError('Please select a workout.');
      return;
    }

    try {
      setIsCreating(true);

      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('User not authenticated.');
        return;
      }

      const workoutRec = await createWorkout({
        userId: user.id,
        name: name.trim(),
        workoutType: typeId,
        date: new Date(),
      });

      const params = new URLSearchParams({
        workoutId: String(workoutRec.id),
        mode: 'NEW' as Mode,
      });

      pendingNavRef.current = `/add-workout-data/question?${params.toString()}`;
      setShowSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create workout.');
    } finally {
      setIsCreating(false);
    }
  };

  function handleCancel() {
    setShowCancelPopUp(true);
  }

  const handleCancelConfirmed = () => {
    setShowCancelPopUp(false);
    navigate('/dashboard');
  };

  const summary: [string, string][] = [
    ['Name', name],
    ['Workout type:', subgroup],
    ['Selected workout:', typeLabelInit],
  ];

  return (
    <div className="wizard-step">
      <div className="wizard-form">
        {error && (
          <ErrorPopUp onClose={() => setError(null)}>{error}</ErrorPopUp>
        )}

        {summary.map(([label, value]) => (
          <motion.label
            key={label}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.8,
              delay: 0.5,
              ease: [0, 0.71, 0.2, 1.01],
            }}
            className="field"
          >
            <span className="field-label">{label}</span>
            <TextInput value={value} onChange={() => {}} readOnly />
          </motion.label>
        ))}

        <Button
          onClick={handleCreate}
          width="full"
          disabled={isCreating || !typeId}
        >
          {isCreating ? <LoadingCircle size={18} /> : 'Create'}
        </Button>
        <Button onClick={handleCancel} width="full">
          Cancel
        </Button>
      </div>

      {showCancelPopUp && (
        <QuestionPopUp
          title="Discard workout?"
          text="Everything you set up so far will be lost."
          noLabel="Keep editing"
          yesLabel="Discard"
          tone="danger"
          onYes={handleCancelConfirmed}
          onNo={() => setShowCancelPopUp(false)}
        />
      )}

      {showSuccess && (
        <SuccessAnimation
          message="Workout created!"
          doneDelay={1500}
          onDone={() => {
            setShowSuccess(false);
            if (pendingNavRef.current) {
              navigate(pendingNavRef.current, true);
            }
          }}
        />
      )}
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={null}>
      <PreviewContent />
    </Suspense>
  );
}
