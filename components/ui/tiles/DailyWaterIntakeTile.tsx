'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { IconDropletFilled } from '@tabler/icons-react';
import AddIcon from '@/components/icons/AddIcon';
import DeleteIcon from '@/components/icons/DeleteIcon';
import Button from '@/components/ui/buttons/Button';
import BottomDrawer from '@/components/ui/drawer/BottomDrawer';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import NumericInput from '@/components/ui/inputs/NumericInput';
import { parseDateKey } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { DEFAULT_DAILY_WATER_GOAL_ML } from '@/services/userData';
import {
  addWaterIntake,
  deleteWaterIntake,
  getWaterEntriesForDay,
  getWaterHistory,
  WaterIntakeDay,
  WaterIntakeEntry,
} from '@/services/waterIntake';
import { CommonTileProps } from './common';
import Tile from './Tile';

type DailyWaterIntakeTileProps = CommonTileProps & {
  goalMl?: number;
  onError?: (message: string) => void;
};

const WAVE_PATH =
  'M0 6 C 25 0, 50 0, 75 6 S 125 12, 150 6 S 200 0, 225 6 S 275 12, 300 6 V 14 H 0 Z';
const STEP_ML = 100;
const DEFAULT_AMOUNT_ML = 200;
const MAX_AMOUNT_ML = 5000;
const QUICK_AMOUNTS_ML = [250, 500];
const HISTORY_DAYS = 7;

const litersFormat = new Intl.NumberFormat('en', {
  maximumFractionDigits: 2,
});

const timeFormat = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
});

const weekdayFormat = new Intl.DateTimeFormat('en', { weekday: 'narrow' });

function formatLiters(ml: number) {
  return `${litersFormat.format(ml / 1000)} L`;
}

export default function DailyWaterIntakeTile({
  tileHeight,
  tileWidth,
  goalMl = DEFAULT_DAILY_WATER_GOAL_ML,
  onError,
}: DailyWaterIntakeTileProps) {
  const [entries, setEntries] = useState<WaterIntakeEntry[]>([]);
  const [history, setHistory] = useState<WaterIntakeDay[]>([]);
  const [amountMl, setAmountMl] = useState(DEFAULT_AMOUNT_ML);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showPercent, setShowPercent] = useState(false);

  const totalMl = entries.reduce((sum, entry) => sum + entry.amount_ml, 0);

  useEffect(() => {
    let cancelled = false;

    getWaterEntriesForDay(new Date())
      .then((data) => {
        if (!cancelled) setEntries(data);
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          onError?.(
            loadError instanceof Error
              ? loadError.message
              : 'Could not load water intake.'
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [onError]);

  useEffect(() => {
    if (!isDrawerOpen) return;

    let cancelled = false;

    getWaterHistory(HISTORY_DAYS)
      .then((data) => {
        if (!cancelled) setHistory(data);
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          onError?.(
            loadError instanceof Error
              ? loadError.message
              : 'Could not load water history.'
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isDrawerOpen, onError]);

  async function addAmount(amount: number, closeAfter: boolean) {
    if (isAdding || amount <= 0) return;

    setIsAdding(true);
    try {
      const entry = await addWaterIntake({
        date: new Date(),
        amountMl: amount,
      });
      setEntries((current) => [entry, ...current]);
      if (closeAfter) {
        setIsDrawerOpen(false);
        setAmountMl(DEFAULT_AMOUNT_ML);
      }
    } catch (addError) {
      onError?.(
        addError instanceof Error ? addError.message : 'Could not add water.'
      );
    } finally {
      setIsAdding(false);
    }
  }

  async function removeEntry(entryId: string) {
    if (deletingId) return;

    setDeletingId(entryId);
    try {
      await deleteWaterIntake(entryId);
      setEntries((current) => current.filter((entry) => entry.id !== entryId));
    } catch (deleteError) {
      onError?.(
        deleteError instanceof Error
          ? deleteError.message
          : 'Could not delete water entry.'
      );
    } finally {
      setDeletingId(null);
    }
  }

  const percent = goalMl > 0 ? Math.round((totalMl / goalMl) * 100) : 0;
  const fillRatio = Math.min(percent, 100) / 100;

  const historyWithToday = history.map((day, index) =>
    index === history.length - 1 ? { ...day, totalMl } : day
  );

  return (
    <>
      <Tile width={tileWidth} height={tileHeight} className="water-tile-card">
        <motion.div
          aria-hidden="true"
          initial={false}
          animate={{
            height: `${fillRatio * 100}%`,
            opacity: fillRatio > 0 ? 1 : 0,
          }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="water-tile-fill"
        >
          <svg
            viewBox="0 0 150 14"
            preserveAspectRatio="none"
            className="water-tile-wave"
          >
            <motion.path
              d={WAVE_PATH}
              animate={{ x: [0, -150] }}
              transition={{ duration: 6, ease: 'linear', repeat: Infinity }}
            />
          </svg>
        </motion.div>

        <div className="water-tile">
          <button
            type="button"
            aria-label={
              showPercent ? 'Show amount in liters' : 'Show percent of goal'
            }
            onClick={() => setShowPercent((current) => !current)}
            className="water-tile-info"
          >
            <span className="water-tile-caption">
              <IconDropletFilled size={14} />
              Water
            </span>
            <span className="water-tile-value">
              {showPercent ? `${percent}%` : formatLiters(totalMl)}
            </span>
            <span className="water-tile-goal">
              {showPercent
                ? `${formatLiters(totalMl)} of ${formatLiters(goalMl)}`
                : `of ${formatLiters(goalMl)}`}
            </span>
          </button>

          <button
            type="button"
            aria-label="Add water"
            onClick={() => setIsDrawerOpen(true)}
            className="water-tile-add"
          >
            <AddIcon size={22} />
          </button>
        </div>
      </Tile>

      <BottomDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Add water"
      >
        <div className="water-form">
          <p className="water-form-summary">
            Today: {totalMl} ml of {goalMl} ml ({percent}%)
          </p>

          <div className="water-quick">
            {QUICK_AMOUNTS_ML.map((amount) => (
              <button
                key={amount}
                type="button"
                disabled={isAdding}
                onClick={() => addAmount(amount, false)}
                className="chip water-quick-chip"
              >
                +{amount} ml
              </button>
            ))}
          </div>

          <NumericInput
            label="Amount (ml)"
            value={amountMl}
            min={0}
            max={MAX_AMOUNT_ML}
            step={STEP_ML}
            placeholder="0"
            onChange={(value) => setAmountMl(Number(value))}
          />

          <Button
            onClick={() => addAmount(amountMl, true)}
            width="full"
            disabled={isAdding || amountMl <= 0}
          >
            {isAdding ? <LoadingCircle size={18} /> : 'Add'}
          </Button>

          <section className="water-section">
            <p className="water-section-title">Today&apos;s entries</p>
            {entries.length === 0 ? (
              <p className="water-empty">No water added today.</p>
            ) : (
              <ul className="water-entries">
                {entries.map((entry) => (
                  <li key={entry.id} className="water-entry">
                    <span className="water-entry-amount">
                      {entry.amount_ml} ml
                    </span>
                    <span className="water-entry-time">
                      {timeFormat.format(new Date(entry.created_at))}
                    </span>
                    <button
                      type="button"
                      aria-label={`Delete ${entry.amount_ml} ml entry`}
                      disabled={deletingId !== null}
                      onClick={() => removeEntry(entry.id)}
                      className="icon-btn water-entry-delete"
                    >
                      {deletingId === entry.id ? (
                        <LoadingCircle size={16} />
                      ) : (
                        <DeleteIcon size={16} />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {historyWithToday.length > 0 && (
            <section className="water-section">
              <p className="water-section-title">Last 7 days</p>
              <div className="water-history">
                {historyWithToday.map((day) => {
                  const ratio = goalMl > 0 ? day.totalMl / goalMl : 0;
                  return (
                    <div key={day.date} className="water-history-day">
                      <div className="water-history-track">
                        <div
                          className={cn(
                            'water-history-bar',
                            ratio >= 1 && 'water-history-bar-done'
                          )}
                          style={{ height: `${Math.min(ratio, 1) * 100}%` }}
                        />
                      </div>
                      <span className="water-history-label">
                        {weekdayFormat.format(parseDateKey(day.date))}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </BottomDrawer>
    </>
  );
}
