import { s, useResponsive } from '@/lib/useResponsive';
import Tile from './Tile';
import { colors } from '@/theme/colors';
import ProgressBar from '../ProgressBar';
import { fontSizes } from '@/theme/typography';

type Range = {
  name: string;
  min: number;
  max: number;
};

const animalRanges: Range[] = [
  { name: 'Dog 🐶', min: 0, max: 50 },
  { name: 'Wolf 🐺', min: 50, max: 100 },
  { name: 'Tiger 🐅', min: 100, max: 200 },
  { name: 'Lion 🦁', min: 200, max: 300 },
  { name: 'Gorilla 🦍', min: 300, max: 450 },
  { name: 'Bull 🐂', min: 450, max: 650 },
  { name: 'Bear 🐻', min: 650, max: 900 },
  { name: 'Elephant 🐘', min: 900, max: 1200 },
];

function getRangeWithBounds(value: number) {
  for (let i = 0; i < animalRanges.length - 1; i++) {
    const current = animalRanges[i];
    const next = animalRanges[i + 1];

    if (value >= current.min && value < current.max) {
      return {
        lower: current,
        upper: next,
        progress: (value - current.min) / (current.max - current.min),
      };
    }
  }

  const last = animalRanges[animalRanges.length - 1];
  return {
    lower: last,
    upper: last,
    progress: 1,
  };
}

export default function TotalWeightMovedTile() {
  const { isMobile, scale } = useResponsive();
  const value = 120;

  const { lower, upper } = getRangeWithBounds(value);

  return (
    <Tile width={350} height={150}>
      <p
        style={{
          margin: 0,
          fontSize: s(
            isMobile ? fontSizes.caption : fontSizes.bodySmall,
            scale
          ),
          fontWeight: 800,
          color: colors.text,
          marginBottom: s(10, scale),
        }}
      >
        Total weight moved this week!
      </p>

      <div
        style={{
          position: 'relative',
          width: '100%',
        }}
      >
        <ProgressBar
          value={value}
          min={lower.min}
          max={upper.max}
          color="#30D158"
          labelLeft={lower.name}
          labelRight={upper.name}
          showLabels={true}
        ></ProgressBar>
      </div>
      <p
        style={{
          margin: 0,
          fontSize: s(
            isMobile ? fontSizes.caption : fontSizes.bodySmall,
            scale
          ),
          fontWeight: 800,
          color: colors.text,
          marginTop: s(10, scale),
        }}
      >
        You&apos;ve already moved weight of a {lower.name}, need
        <span style={{ color: '#30D158', fontWeight: 700 }}>
          {' '}
          {upper.max - value} kg{' '}
        </span>
        more to reach weight of a {upper.name}.
      </p>
    </Tile>
  );
}
