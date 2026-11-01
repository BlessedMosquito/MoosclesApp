'use client';

import { Gauge } from '@/components/charts/gauge';
import { getLevelProgress } from '@/lib/helpers';
import { colors } from '@/theme/colors';
import Tile from './Tile';

const TILE_PADDING = 14;

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
  const levelData = getLevelProgress(experience);
  const percent = Math.round(levelData.progress * 100);

  const gaugeWidth = Math.max(0, tileWidth - TILE_PADDING * 2);
  const gaugeHeight = Math.max(0, tileHeight - TILE_PADDING * 2 - 56);

  return (
    <Tile
      title="Level"
      titleAlign="center"
      width={tileWidth}
      height={tileHeight}
    >
      <div className="level-gauge">
        <Gauge
          activeFill={colors.accent}
          centerValue={levelData.level}
          defaultLabel={`${percent}%`}
          height={gaugeHeight}
          inactiveFill={colors.textMuted}
          value={percent}
          width={gaugeWidth}
        />

        <p className="level-gauge-caption">
          lvl {levelData.level} → lvl {levelData.level + 1}
        </p>
      </div>
    </Tile>
  );
}
