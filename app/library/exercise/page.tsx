'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import ProgressChart from '@/components/library/ProgressChart';
import TrendBadge from '@/components/library/TrendBadge';
import BackButton from '@/components/ui/buttons/BackButton';
import ErrorPopUp from '@/components/ui/feedback/ErrorPopUp';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import Tabs from '@/components/ui/tabs/Tabs';
import TopBar from '@/components/ui/topBar/TopBar';
import { formatWeight } from '@/lib/format';
import { getFormatedDate, parseDateKey } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import {
  ExerciseHistory,
  ExerciseSession,
  getExerciseHistory,
  getPersonalRecords,
  getSessionTrend,
} from '@/services/exerciseStats';

type ChartMetric = 'weight' | 'volume' | 'oneRepMax';

const METRIC_TABS: { value: ChartMetric; label: string }[] = [
  { value: 'weight', label: 'Top weight' },
  { value: 'volume', label: 'Volume' },
  { value: 'oneRepMax', label: 'Est. 1RM' },
];

const METRIC_VALUE: Record<ChartMetric, (session: ExerciseSession) => number> =
  {
    weight: (session) => session.bestWeight,
    volume: (session) => session.volume,
    oneRepMax: (session) => session.estimatedOneRepMax,
  };

function formatDate(value: string, showYear = false) {
  return getFormatedDate({
    date: parseDateKey(value),
    showYear,
    nameMonth: true,
  });
}

function formatVolume(value: number) {
  return `${Math.round(value).toLocaleString('en-US')} kg`;
}

function ExerciseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const key = searchParams.get('key') ?? '';

  const [history, setHistory] = useState<ExerciseHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [metric, setMetric] = useState<ChartMetric>('weight');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!key) return;
    let cancelled = false;

    getExerciseHistory(key)
      .then((data) => {
        if (!cancelled) setHistory(data);
      })
      .catch((loadError: unknown) => {
        if (cancelled) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Could not load exercise.'
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [key]);

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.replace('/library?tab=exercises');
  }

  const sessions = history?.sessions ?? [];
  const records = getPersonalRecords(sessions);
  const formatMetric = metric === 'volume' ? formatVolume : formatWeight;
  const points = sessions.map((session) => ({
    date: session.date,
    value: METRIC_VALUE[metric](session),
  }));

  const first = sessions[0];
  const last = sessions[sessions.length - 1];
  const weightChange = first && last ? last.bestWeight - first.bestWeight : 0;

  return (
    <main className="page page-padded">
      <div className="page-content page-content-narrow">
        <TopBar
          left={<BackButton onClick={goBack} />}
          center={history?.name ?? 'Exercise'}
        />

        {error && (
          <ErrorPopUp onClose={() => setError(null)}>{error}</ErrorPopUp>
        )}

        {key && isLoading ? (
          <div className="library-empty">
            <LoadingCircle />
          </div>
        ) : !history || sessions.length === 0 ? (
          <div className="library-empty">
            <p className="muted-text">No sets logged for this exercise yet.</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="exercise-progress"
          >
            <section className="exercise-summary">
              <div className="exercise-summary-item">
                <span className="exercise-summary-label">Sessions</span>
                <span className="exercise-summary-value">
                  {sessions.length}
                </span>
              </div>
              <div className="exercise-summary-item">
                <span className="exercise-summary-label">Last top set</span>
                <span className="exercise-summary-value">
                  {formatWeight(last.bestWeight)} × {last.repsAtBestWeight}
                </span>
              </div>
              <div className="exercise-summary-item">
                <span className="exercise-summary-label">Since first</span>
                <span
                  className={cn(
                    'exercise-summary-value',
                    weightChange > 0 && 'text-accent',
                    weightChange < 0 && 'text-danger-light'
                  )}
                >
                  {weightChange > 0 ? '+' : ''}
                  {formatWeight(weightChange)}
                </span>
              </div>
            </section>

            <section className="library-panel">
              <Tabs tabs={METRIC_TABS} value={metric} onChange={setMetric} />
              <ProgressChart points={points} formatValue={formatMetric} />
            </section>

            <section className="library-panel">
              <h2 className="library-panel-title">Personal records</h2>
              <div className="records-grid">
                {records.heaviest && (
                  <div className="record-tile">
                    <span className="record-label">Heaviest set</span>
                    <span className="record-value">
                      {formatWeight(records.heaviest.bestWeight)} ×{' '}
                      {records.heaviest.repsAtBestWeight}
                    </span>
                    <span className="record-date">
                      {formatDate(records.heaviest.date, true)}
                    </span>
                  </div>
                )}
                {records.mostReps && (
                  <div className="record-tile">
                    <span className="record-label">Most reps</span>
                    <span className="record-value">
                      {records.mostReps.maxReps} reps
                    </span>
                    <span className="record-date">
                      {formatDate(records.mostReps.date, true)}
                    </span>
                  </div>
                )}
                {records.bestVolume && (
                  <div className="record-tile">
                    <span className="record-label">Best volume</span>
                    <span className="record-value">
                      {formatVolume(records.bestVolume.volume)}
                    </span>
                    <span className="record-date">
                      {formatDate(records.bestVolume.date, true)}
                    </span>
                  </div>
                )}
                {records.bestOneRepMax && (
                  <div className="record-tile">
                    <span className="record-label">Est. 1RM</span>
                    <span className="record-value">
                      {formatWeight(records.bestOneRepMax.estimatedOneRepMax)}
                    </span>
                    <span className="record-date">
                      {formatDate(records.bestOneRepMax.date, true)}
                    </span>
                  </div>
                )}
              </div>
            </section>

            <section className="library-panel">
              <h2 className="library-panel-title">History</h2>
              <ul className="session-list">
                {[...sessions].reverse().map((session, index) => {
                  const previous = sessions[sessions.length - 2 - index];
                  const trend = getSessionTrend(session, previous);

                  return (
                    <li key={session.exerciseId} className="session-item">
                      <div className="session-header">
                        <div className="session-heading">
                          <span className="session-date">
                            {formatDate(session.date, true)}
                          </span>
                          <span className="session-workout">
                            {session.workoutName}
                          </span>
                        </div>
                        <TrendBadge trend={trend} showLabel />
                      </div>
                      <div className="session-sets">
                        {session.sets.map((set, setIndex) => (
                          <span
                            key={setIndex}
                            className={cn(
                              'session-set',
                              set.weight === session.bestWeight &&
                                set.reps === session.repsAtBestWeight &&
                                'session-set-top'
                            )}
                          >
                            {formatWeight(set.weight)} × {set.reps}
                          </span>
                        ))}
                      </div>
                      <span className="session-volume">
                        Volume {formatVolume(session.volume)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          </motion.div>
        )}
      </div>
    </main>
  );
}

export default function ExerciseProgressPage() {
  return (
    <Suspense fallback={null}>
      <ExerciseContent />
    </Suspense>
  );
}
