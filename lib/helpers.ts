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
