'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import AddIcon from '@/components/icons/AddIcon';
import MinusIcon from '@/components/icons/MinusIcon';
import { cn } from '@/lib/utils';

type NumericInputProps = {
  value: number | string;
  min: number;
  max: number;
  placeholder: string;
  onChange: (value: number | string) => void;
  disabled?: boolean;
  label?: string;
  decimal?: boolean;
  step?: number;
};

const HOLD_DELAY = 400;
const HOLD_INTERVAL = 70;
const DIGIT_TRANSITION = { duration: 0.3, ease: [0.22, 1, 0.36, 1] } as const;

const digitVariants = {
  enter: (direction: number) => ({ y: `${direction * 100}%`, opacity: 0 }),
  center: { y: '0%', opacity: 1 },
  exit: (direction: number) => ({ y: `${direction * -100}%`, opacity: 0 }),
};

function toNumber(value: number | string) {
  const parsed = Number(String(value).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatStepped(value: number, decimal: boolean) {
  const rounded = Math.round(value * 100) / 100;
  return decimal ? String(rounded).replace('.', ',') : String(rounded);
}

export default function NumericInput({
  value,
  min,
  max,
  placeholder,
  onChange,
  disabled,
  label,
  decimal = false,
  step = 1,
}: NumericInputProps) {
  const reduceMotion = useReducedMotion();
  const valueRef = useRef(value);
  const holdTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const [direction, setDirection] = useState(1);
  const [isFocused, setIsFocused] = useState(false);

  const cleanPattern = decimal ? /[^0-9.,]/g : /[^0-9]/g;
  const display = String(value);
  const isEmpty = display === '';
  const numericValue = toNumber(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => stopHold, []);

  function emit(next: number | string) {
    const nextNumber = toNumber(next);
    const currentNumber = toNumber(valueRef.current);
    if (nextNumber !== currentNumber) {
      setDirection(nextNumber > currentNumber ? 1 : -1);
    }
    valueRef.current = next;
    onChange(next);
  }

  function sanitize(raw: string): string {
    let cleaned = raw.replace(cleanPattern, '');
    if (decimal) {
      const firstSep = cleaned.search(/[.,]/);
      if (firstSep !== -1) {
        const head = cleaned.slice(0, firstSep);
        const sep = cleaned[firstSep];
        const tail = cleaned
          .slice(firstSep + 1)
          .replace(/[.,]/g, '')
          .slice(0, 2);
        cleaned = head + sep + tail;
      }
    }
    return cleaned;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = sanitize(e.target.value);

    if (typeof value === 'string') {
      if (raw !== '' && toNumber(raw) > max) return;
      emit(raw);
      return;
    }

    const parsed = Number(raw);
    const num = Number.isNaN(parsed) ? 0 : Math.floor(parsed);
    emit(Math.min(Math.max(min, num), max));
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    setIsFocused(false);
    if (typeof value === 'string') {
      if (e.target.value === '') emit('');
      return;
    }
    if (e.target.value === '') emit(0);
  }

  function stepBy(delta: number) {
    const current = toNumber(valueRef.current);
    const next = Math.min(Math.max(min, current + delta), max);
    if (next === current && valueRef.current !== '') return false;
    emit(
      typeof valueRef.current === 'string' ? formatStepped(next, decimal) : next
    );
    return true;
  }

  function stopHold() {
    if (holdTimeout.current) clearTimeout(holdTimeout.current);
    if (holdInterval.current) clearInterval(holdInterval.current);
    holdTimeout.current = null;
    holdInterval.current = null;
  }

  function startHold(delta: number) {
    if (disabled) return;
    stopHold();
    if (!stepBy(delta)) return;
    holdTimeout.current = setTimeout(() => {
      holdInterval.current = setInterval(() => {
        if (!stepBy(delta)) stopHold();
      }, HOLD_INTERVAL);
    }, HOLD_DELAY);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      stepBy(step);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      stepBy(-step);
    }
  }

  const chars = (isEmpty ? placeholder : display).split('');

  return (
    <div className="numeric-field">
      {label && <span className="numeric-label">{label}</span>}
      <div
        className={cn(
          'number-flow',
          isFocused && 'number-flow-focused',
          disabled && 'number-flow-disabled'
        )}
      >
        <motion.button
          type="button"
          aria-label="Decrease number"
          disabled={disabled || (!isEmpty && numericValue <= min)}
          whileTap={{ scale: 0.88 }}
          onPointerDown={() => startHold(-step)}
          onPointerUp={stopHold}
          onPointerLeave={stopHold}
          onPointerCancel={stopHold}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              stepBy(-step);
            }
          }}
          className="number-flow-button"
        >
          <MinusIcon size={16} />
        </motion.button>

        <div className="number-flow-display">
          <span
            aria-hidden
            className={cn(
              'number-flow-digits',
              isEmpty && 'number-flow-placeholder',
              isFocused && 'opacity-0'
            )}
          >
            {chars.map((char, index) => {
              const position = chars.length - index;
              return (
                <span key={position} className="number-flow-digit">
                  <AnimatePresence
                    initial={false}
                    mode="popLayout"
                    custom={direction}
                  >
                    <motion.span
                      key={char}
                      custom={direction}
                      variants={digitVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={
                        reduceMotion ? { duration: 0 } : DIGIT_TRANSITION
                      }
                      className="number-flow-char"
                    >
                      {char}
                    </motion.span>
                  </AnimatePresence>
                </span>
              );
            })}
          </span>

          <input
            inputMode={decimal ? 'decimal' : 'numeric'}
            aria-label={label ?? placeholder}
            placeholder={placeholder}
            enterKeyHint="done"
            value={value}
            onChange={handleChange}
            onFocus={(e) => {
              const input = e.target;
              setIsFocused(true);
              requestAnimationFrame(() => input.select());
            }}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className={cn(
              'number-flow-input',
              isFocused && 'number-flow-input-active'
            )}
          />
        </div>

        <motion.button
          type="button"
          aria-label="Increase number"
          disabled={disabled || numericValue >= max}
          whileTap={{ scale: 0.88 }}
          onPointerDown={() => startHold(step)}
          onPointerUp={stopHold}
          onPointerLeave={stopHold}
          onPointerCancel={stopHold}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              stepBy(step);
            }
          }}
          className="number-flow-button"
        >
          <AddIcon size={16} />
        </motion.button>
      </div>
    </div>
  );
}
