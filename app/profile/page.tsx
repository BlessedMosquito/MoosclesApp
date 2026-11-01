'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';

import LogoutIcon from '@/components/icons/LogoutIcon';
import SaveIcon from '@/components/icons/SaveIcon';
import Button from '@/components/ui/buttons/Button';
import ErrorPopUp from '@/components/ui/feedback/ErrorPopUp';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import SuccessAnimation from '@/components/ui/feedback/SuccessAnimation';
import DistanceInput from '@/components/ui/inputs/DistanceInput';
import NumericInput from '@/components/ui/inputs/NumericInput';
import TextInput from '@/components/ui/inputs/TextInput';
import TimeInput from '@/components/ui/inputs/TimeInput';
import Tabs from '@/components/ui/tabs/Tabs';
import { formatDistance, formatDuration } from '@/lib/format';
import { createClient } from '@/lib/supabase/client';
import {
  DEFAULT_DAILY_WATER_GOAL_ML,
  getAgeFromBirthYear,
  getBirthYearFromAge,
  getUserData,
  upsertUserData,
} from '@/services/userData';
import { PROFILE_PROMPT_DISMISSED_KEY } from '@/app/constants/storageConstants';

type ProfileTab = 'account' | 'body' | 'goals';

type ProfileForm = {
  firstName: string;
  age: string;
  weight: string;
  weeklyDuration: { hours: number; minutes: number };
  weeklyDistance: { km: number; m: number };
  dailyWaterGoal: number;
};

const PROFILE_TABS: { value: ProfileTab; label: string }[] = [
  { value: 'account', label: 'Account' },
  { value: 'body', label: 'Body' },
  { value: 'goals', label: 'Goals' },
];

function isProfileTab(value: string | null): value is ProfileTab {
  return PROFILE_TABS.some((tab) => tab.value === value);
}

function parseOptionalNumber(value: string) {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const parsed = Number(trimmed.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : NaN;
}

const EMPTY_FORM: ProfileForm = {
  firstName: '',
  age: '',
  weight: '',
  weeklyDuration: { hours: 0, minutes: 0 },
  weeklyDistance: { km: 0, m: 0 },
  dailyWaterGoal: DEFAULT_DAILY_WATER_GOAL_ML,
};

function isSameForm(a: ProfileForm, b: ProfileForm) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function ProfileContent() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState<ProfileTab>(
    isProfileTab(initialTab) ? initialTab : 'account'
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [savedForm, setSavedForm] = useState<ProfileForm>(EMPTY_FORM);

  const isDirty = !isSameForm(form, savedForm);

  async function loadData() {
    setIsLoading(true);

    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        setError(error?.message ?? 'User not found');
        return;
      }

      const userData = await getUserData(user.id);
      const duration = formatDuration(userData.weekly_duration_goal_minutes);
      const age = getAgeFromBirthYear(userData.birth_year);
      const loadedForm: ProfileForm = {
        firstName: user.user_metadata?.first_name ?? '',
        age: age === null ? '' : String(age),
        weight:
          userData.weight_kg === null
            ? ''
            : String(userData.weight_kg).replace('.', ','),
        weeklyDuration: { hours: duration.h, minutes: duration.m },
        weeklyDistance: formatDistance(userData.weekly_distance_goal_meters),
        dailyWaterGoal: userData.daily_water_goal_ml,
      };

      setEmail(user.email ?? '');
      setForm(loadedForm);
      setSavedForm(loadedForm);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load data.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase.auth]);

  function updateForm<K extends keyof ProfileForm>(
    key: K,
    value: ProfileForm[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function signOut() {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        setError(error.message);
        return;
      }

      window.sessionStorage.removeItem(PROFILE_PROMPT_DISMISSED_KEY);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    const age = parseOptionalNumber(form.age);
    const weight = parseOptionalNumber(form.weight);

    if (age !== null && (Number.isNaN(age) || age < 10 || age > 120)) {
      setActiveTab('body');
      setError('Age must be between 10 and 120.');
      return;
    }

    if (
      weight !== null &&
      (Number.isNaN(weight) || weight < 20 || weight > 400)
    ) {
      setActiveTab('body');
      setError('Weight must be between 20 and 400 kg.');
      return;
    }

    if (form.dailyWaterGoal < 250 || form.dailyWaterGoal > 10000) {
      setActiveTab('goals');
      setError('Daily water goal must be between 250 and 10000 ml.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError('Not authenticated.');
        return;
      }

      if (form.firstName !== savedForm.firstName) {
        const { error } = await supabase.auth.updateUser({
          data: { first_name: form.firstName },
        });

        if (error) {
          setError(error.message);
          return;
        }
      }

      await upsertUserData({
        userId: user.id,
        weeklyDistanceGoal:
          form.weeklyDistance.km * 1000 + form.weeklyDistance.m,
        weeklyDurationGoal:
          form.weeklyDuration.hours * 60 + form.weeklyDuration.minutes,
        dailyWaterGoal: form.dailyWaterGoal,
        birthYear: age === null ? null : getBirthYearFromAge(age),
        weightKg: weight === null ? null : Math.round(weight * 10) / 10,
      });

      setSavedForm(form);
      setShowSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save changes.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="page page-padded">
      <div className="page-content page-content-narrow">
        <header className="profile-header">
          <h1 className="page-title">Profile</h1>
          {email && <p className="profile-subtitle">{email}</p>}
        </header>

        <Tabs tabs={PROFILE_TABS} value={activeTab} onChange={setActiveTab} />

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            role="tabpanel"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="profile-form"
          >
            {activeTab === 'account' ? (
              <>
                <div className="field">
                  <span className="field-label">Name</span>
                  <TextInput
                    value={form.firstName}
                    onChange={(value) => updateForm('firstName', value)}
                    placeholder="Your name"
                  />
                </div>

                <div className="field">
                  <span className="field-label">Email</span>
                  <TextInput
                    value={email}
                    onChange={() => {}}
                    disabled
                    readOnly
                  />
                  <span className="field-hint">
                    Email can&apos;t be changed.
                  </span>
                </div>

                <div className="profile-danger">
                  <Button onClick={signOut} variant="danger" width="full">
                    <LogoutIcon />
                    Logout
                  </Button>
                </div>
              </>
            ) : activeTab === 'body' ? (
              <>
                <div className="field">
                  <span className="field-label">Age</span>
                  <NumericInput
                    label="Years"
                    value={form.age}
                    min={0}
                    max={120}
                    placeholder="—"
                    onChange={(value) => updateForm('age', String(value))}
                  />
                </div>

                <div className="field">
                  <span className="field-label">Weight</span>
                  <NumericInput
                    label="Kilograms"
                    value={form.weight}
                    min={0}
                    max={400}
                    step={0.5}
                    decimal
                    placeholder="—"
                    onChange={(value) => updateForm('weight', String(value))}
                  />
                  <span className="field-hint">
                    Used to estimate burned calories in the future.
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="field">
                  <span className="field-label">Weekly workout time</span>
                  <TimeInput
                    hours={form.weeklyDuration.hours}
                    minutes={form.weeklyDuration.minutes}
                    onChange={(value) => updateForm('weeklyDuration', value)}
                    disabled={false}
                  />
                </div>

                <div className="field">
                  <span className="field-label">Weekly distance</span>
                  <DistanceInput
                    value={form.weeklyDistance}
                    onChange={(value) => updateForm('weeklyDistance', value)}
                    disabled={false}
                  />
                </div>

                <div className="field">
                  <span className="field-label">Daily water</span>
                  <NumericInput
                    label="Milliliters"
                    value={form.dailyWaterGoal}
                    min={0}
                    max={10000}
                    step={250}
                    placeholder="2000"
                    onChange={(value) =>
                      updateForm('dailyWaterGoal', Number(value))
                    }
                  />
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {isDirty && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="profile-actions"
            >
              <Button
                onClick={() => setForm(savedForm)}
                width="full"
                disabled={isSaving}
                variant="danger"
              >
                Discard
              </Button>
              <Button onClick={handleSave} width="full" disabled={isSaving}>
                {isSaving ? (
                  <LoadingCircle size={18} />
                ) : (
                  <>
                    <SaveIcon />
                    Save
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isLoading && (
        <div className="overlay overlay-light">
          <LoadingCircle />
        </div>
      )}

      {error && <ErrorPopUp onClose={() => setError(null)}>{error}</ErrorPopUp>}

      {showSuccess && (
        <SuccessAnimation
          message="Data successfully saved!"
          onDone={() => {
            setShowSuccess(false);
          }}
          doneDelay={1500}
        />
      )}
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileContent />
    </Suspense>
  );
}
