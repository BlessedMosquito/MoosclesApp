'use client';

import { Gauge } from '@/components/charts/gauge';
import { getLevelProgress } from '@/lib/helpers';
import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';
import Tile from './Tile';

type Props = {
  experience: number;
  tileWidth: number;
  tileHeight: number;
};

export default function LevelGaugeTile({
  experience,
  tileWidth,
  tileHeight,
}: Props) {
  const { scale } = useResponsive();

  const levelData = getLevelProgress(experience);
  const percent = Math.round(levelData.progress * 100);

  const padding = s(14, scale);
  const gaugeWidth = Math.max(0, tileWidth - padding * 2);
  const gaugeHeight = Math.max(0, tileHeight - padding * 2 - s(56, scale));

  return (
    <Tile
      title="Level"
      titleAlign="center"
      width={tileWidth}
      height={tileHeight}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
          gap: s(8, scale),
        }}
      >
        <Gauge
          activeFill={colors.accent}
          centerValue={levelData.level}
          defaultLabel={`${percent}%`}
          height={gaugeHeight}
          inactiveFill={colors.textMuted}
          value={percent}
          width={gaugeWidth}
        />

        <p
          style={{
            margin: 0,
            fontSize: s(fontSizes.caption, scale),
            color: colors.textMuted,
            fontWeight: 700,
          }}
        >
          lvl {levelData.level} → lvl {levelData.level + 1}
        </p>
      </div>
    </Tile>
  );
}
