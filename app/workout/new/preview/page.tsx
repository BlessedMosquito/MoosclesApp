'use client';

import QuestionPopUp from '@/components/ui/popups/QuestionPopUp';
import Button from '@/components/ui/buttons/Button';
import ErrorPopUp from '@/components/ui/feedback/ErrorPopUp';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import SuccessAnimation from '@/components/ui/feedback/SuccessAnimation';
import TextInput from '@/components/ui/inputs/TextInput';
import { createClient } from '@/lib/supabase/client';
import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';
import { Mode } from '@/types/common';
import { createWorkout } from '@/services/workouts';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useSetBackRoute, useSetText, useStartLeave } from '../layout';
import { motion } from 'motion/react';

function PreviewContent() {
  const { isMobile, scale } = useResponsive();
  const router = useRouter();
  const searchParams = useSearchParams();
  const setBackRoute = useSetBackRoute();
  const setText = useSetText();
  const startLeave = useStartLeave();

  const subgroup = searchParams.get('subgroup') ?? '';
  const workoutNameInit = searchParams.get('workoutName') ?? '';
  const typeLabelInit = searchParams.get('typeLabel') ?? '';

  const [group, setGroup] = useState(subgroup);
  const [name, setName] = useState(workoutNameInit);
  const [workout, setWorkout] = useState(typeLabelInit);
  const [typeId] = useState(searchParams.get('typeId') ?? '');

  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showCancelPopUp, setShowCancelPopUp] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const pendingNavRef = useRef<string | null>(null);

  useEffect(() => {
    setBackRoute('/workout/new/type');
    setText('Your wokrout');
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

  const navigate = (target: string) => {
    if (!isMobile) {
      router.push(target);
      return;
    }
    startLeave();
    setTimeout(() => {
      router.push(target);
    }, 450);
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

  const labelStyle: CSSProperties = {
    fontSize: s(fontSizes.body, scale),
    color: colors.text,
    fontWeight: 600,
  };

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
          alignItems: 'stretch',
          gap: s(22, scale),
        }}
      >
        {error && (
          <ErrorPopUp onClose={() => setError(null)}>{error}</ErrorPopUp>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.5,
            ease: [0, 0.71, 0.2, 1.01],
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: s(8, scale) }}
        >
          <label style={labelStyle}>Name</label>
          <TextInput value={name} onChange={setName} readOnly />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.5,
            ease: [0, 0.71, 0.2, 1.01],
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: s(8, scale) }}
        >
          <label style={labelStyle}>Workout type:</label>
          <TextInput value={group} onChange={setGroup} readOnly />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.5,
            ease: [0, 0.71, 0.2, 1.01],
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: s(8, scale) }}
        >
          <label style={labelStyle}>Selected workout:</label>
          <TextInput value={workout} onChange={setWorkout} readOnly />
        </motion.div>

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
          text="Do you really want to cancel workout creation?"
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
              navigate(pendingNavRef.current);
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
