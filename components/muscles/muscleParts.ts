import { BodyPart } from './bodyShapes';

export type BodyView = 'front' | 'back';

type MuscleRule = {
  keywords: string[];
  parts: BodyPart[];
  view: BodyView;
};

const MUSCLE_RULES: MuscleRule[] = [
  {
    keywords: ['lower back', 'lumbar', 'erector'],
    parts: ['lower-back'],
    view: 'back',
  },
  {
    keywords: ['middle back', 'upper back', 'rhomboid'],
    parts: ['upper-back', 'trapezius'],
    view: 'back',
  },
  {
    keywords: ['lats', 'latissimus'],
    parts: ['upper-back'],
    view: 'back',
  },
  { keywords: ['trap'], parts: ['trapezius'], view: 'back' },
  { keywords: ['neck'], parts: ['neck'], view: 'front' },
  {
    keywords: ['shoulder', 'delt'],
    parts: ['front-deltoids', 'back-deltoids'],
    view: 'front',
  },
  { keywords: ['chest', 'pec'], parts: ['chest'], view: 'front' },
  { keywords: ['bicep'], parts: ['biceps'], view: 'front' },
  { keywords: ['tricep'], parts: ['triceps'], view: 'back' },
  {
    keywords: ['forearm', 'wrist', 'grip'],
    parts: ['forearm'],
    view: 'front',
  },
  { keywords: ['oblique'], parts: ['obliques'], view: 'front' },
  {
    keywords: ['abdominal', 'abs', 'core'],
    parts: ['abs', 'obliques'],
    view: 'front',
  },
  { keywords: ['abductor'], parts: ['abductors'], view: 'front' },
  { keywords: ['adductor'], parts: ['adductor'], view: 'back' },
  { keywords: ['glute'], parts: ['gluteal'], view: 'back' },
  { keywords: ['hamstring'], parts: ['hamstring'], view: 'back' },
  { keywords: ['quad'], parts: ['quadriceps'], view: 'front' },
  {
    keywords: ['calf', 'calves', 'soleus', 'gastrocnemius'],
    parts: ['calves', 'soleus'],
    view: 'back',
  },
  {
    keywords: ['back'],
    parts: ['upper-back', 'lower-back'],
    view: 'back',
  },
  {
    keywords: ['leg'],
    parts: ['quadriceps', 'calves'],
    view: 'front',
  },
  {
    keywords: ['arm'],
    parts: ['biceps', 'forearm'],
    view: 'front',
  },
];

export function getMuscleHighlight(muscle: string): {
  parts: BodyPart[];
  view: BodyView;
} {
  const name = muscle.toLowerCase();
  const rule = MUSCLE_RULES.find(({ keywords }) =>
    keywords.some((keyword) => name.includes(keyword))
  );
  return rule
    ? { parts: rule.parts, view: rule.view }
    : { parts: [], view: 'front' };
}
