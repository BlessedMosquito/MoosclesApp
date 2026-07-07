import { s, useResponsive } from '@/lib/useResponsive';
import Tile from './Tile';
import { colors } from '@/theme/colors';
import CircularProgress from '../CircularProgress';

export default function WeeklyWorkoutDataTile() {
  const { isMobile, scale } = useResponsive();
  const width = isMobile ? 420 : 600;
  const height = isMobile ? 220 : 350;
  return (
    <Tile width={width} height={height}>
      <p
        style={{
          margin: 0,
          fontSize: s(isMobile ? 12 : 14, scale),
          fontWeight: 800,
          color: colors.text,
        }}
      >
        Your Weekly Summary!
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: s(6, scale),
          marginTop: s(15, scale),
        }}
      >
        <CircularProgress
          title="Calories"
          value={1350}
          min={0}
          max={1500}
          unit="kcal"
        />

        <CircularProgress
          title="Distance"
          value={1.5}
          min={0}
          max={100}
          unit="km"
        />
      </div>
    </Tile>
  );
}
