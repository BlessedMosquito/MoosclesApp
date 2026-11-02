'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { IconChevronRight } from '@tabler/icons-react';
import MuscleIcon from '@/components/muscles/MuscleIcon';
import ErrorPopUp from '@/components/ui/feedback/ErrorPopUp';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import TextInput from '@/components/ui/inputs/TextInput';
import TrendBadge from '@/components/library/TrendBadge';
import { formatWeight } from '@/lib/format';
import { getFormatedDate, parseDateKey } from '@/lib/helpers';
import {
  ExerciseHistory,
  getExerciseHistories,
  getSessionTrend,
} from '@/services/exerciseStats';

export default function ExercisesTab() {
  const router = useRouter();
  const [histories, setHistories] = useState<ExerciseHistory[] | null>(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getExerciseHistories()
      .then((data) => {
        if (!cancelled) setHistories(data);
      })
      .catch((loadError: unknown) => {
        if (cancelled) return;
        setHistories([]);
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Could not load exercises.'
        );
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const query = search.trim().toLowerCase();
  const visible = histories?.filter((history) =>
    history.name.toLowerCase().includes(query)
  );

  return (
    <div className="library-section">
      {error && <ErrorPopUp onClose={() => setError(null)}>{error}</ErrorPopUp>}

      <TextInput
        placeholder="Search exercises"
        value={search}
        onChange={setSearch}
      />

      {!visible ? (
        <div className="library-empty">
          <LoadingCircle />
        </div>
      ) : visible.length === 0 ? (
        <div className="library-empty">
          <p className="muted-text">
            {query
              ? `No exercises matching "${search.trim()}".`
              : 'Log sets in a strength workout to see your progress here.'}
          </p>
        </div>
      ) : (
        <ul className="library-list">
          {visible.map((history, index) => {
            const sessions = history.sessions;
            const last = sessions[sessions.length - 1];
            const trend = getSessionTrend(last, sessions[sessions.length - 2]);

            return (
              <motion.li
                key={history.key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.25,
                  delay: Math.min(index, 10) * 0.03,
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/library/exercise?key=${encodeURIComponent(history.key)}`
                    )
                  }
                  className="library-card"
                >
                  <span className="library-card-icon library-card-icon-muscle">
                    <MuscleIcon
                      muscle={history.primaryMuscle ?? ''}
                      size={34}
                    />
                  </span>
                  <span className="library-card-text">
                    <span className="library-card-title">{history.name}</span>
                    <span className="library-card-meta">
                      {formatWeight(last.bestWeight)} × {last.repsAtBestWeight}{' '}
                      ·{' '}
                      {getFormatedDate({
                        date: parseDateKey(last.date),
                        showYear: false,
                        nameMonth: true,
                      })}{' '}
                      · {sessions.length}{' '}
                      {sessions.length === 1 ? 'session' : 'sessions'}
                    </span>
                  </span>
                  <TrendBadge trend={trend} />
                  <IconChevronRight
                    size={18}
                    stroke={2}
                    className="library-card-chevron"
                  />
                </button>
              </motion.li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
