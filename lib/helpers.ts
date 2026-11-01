import SadFaceIcon from '@/components/icons/SadFace';
import StraightFaceIcon from '@/components/icons/StraightFaceIcon';
import HappyFaceIcon from '@/components/icons/HappyFaceIcon';
import { createElement, type JSX } from 'react';

export function getWeekRange(date = new Date()) {
  const start = new Date(date);

  // JS: niedziela = 0, poniedziałek = 1
  const day = start.getDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;

  start.setDate(start.getDate() - daysFromMonday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  return { start, end };
}

export function toDateKey(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDateKey(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return new Date(value);
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export type GetLevelProgressType = {
  level: number;
  currentExp: number;
  currentLevelExp: number;
  nextLevelExp: number;
  progress: number;
};

export function getLevelProgress(exp: number): GetLevelProgressType {
  const level = Math.floor(Math.sqrt(exp / 100)) + 1;

  const currentLevelExp = Math.pow(level - 1, 2) * 100;
  const nextLevelExp = Math.pow(level, 2) * 100;

  const progress = (exp - currentLevelExp) / (nextLevelExp - currentLevelExp);

  return {
    level,
    currentExp: exp,
    currentLevelExp,
    nextLevelExp,
    progress: Math.min(Math.max(progress, 0), 1),
  };
}

export function iconBasedOnRange({
  value,
  min,
  max,
}: {
  value: number;
  min: number;
  max: number;
}): JSX.Element {
  const iconsArr = [
    createElement(SadFaceIcon),
    createElement(StraightFaceIcon),
    createElement(HappyFaceIcon),
  ];

  if (value <= min) return iconsArr[0];
  if (value >= max) return iconsArr[2];

  const third = (max - min) / 3;
  if (value < min + third) return iconsArr[0];
  if (value < min + third * 2) return iconsArr[1];
  return iconsArr[2];
}

/**
 *
 * @param date
 * @param showYear enable/disable year in formatted date
 * Formats date to: eg. 14th October 2026
 */
export function getFormatedDate({
  date,
  showYear,
  nameMonth,
}: {
  date: Date;
  showYear: boolean;
  nameMonth: boolean;
}) {
  const day = date.getDate();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  if (nameMonth) {
    const suffix = {
      zero: '',
      one: 'st',
      two: 'nd',
      few: 'rd',
      many: 'th',
      other: '',
    }[new Intl.PluralRules('en', { type: 'ordinal' }).select(day)];

    const month = date.toLocaleString('en-US', { month: 'long' });
    return showYear
      ? `${day}${suffix} ${month} ${year}`
      : `${day}${suffix} ${month}`;
  }

  return `${day}/${month}/${year}`;
}
