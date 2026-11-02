'use client';

import { IconTrophyFilled } from '@tabler/icons-react';
import { Gauge } from '@/components/charts/gauge';
import { getLevelProgress } from '@/lib/helpers';
import { colors } from '@/theme/colors';
import Tile from './Tile';

const TILE_PADDING = 14;
const HEADER_HEIGHT = 20;
const FOOTER_HEIGHT = 36;
const CONTENT_GAP = 8;

const xpFormat = new Intl.NumberFormat('en');

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
  const levelExp = levelData.currentExp - levelData.currentLevelExp;
  const levelExpTotal = levelData.nextLevelExp - levelData.currentLevelExp;
  const expToNext = Math.max(0, levelData.nextLevelExp - levelData.currentExp);

  const gaugeWidth = Math.max(0, tileWidth - TILE_PADDING * 2);
  const gaugeHeight = Math.max(
    0,
    tileHeight -
      TILE_PADDING * 2 -
      HEADER_HEIGHT -
      FOOTER_HEIGHT -
      CONTENT_GAP * 2
  );

  return (
    <Tile width={tileWidth} height={tileHeight}>
      <div className="level-tile">
        <div className="level-tile-header">
          <span className="level-tile-caption">
            <IconTrophyFilled size={14} />
            Level
          </span>
          <span className="level-tile-total">
            {xpFormat.format(levelData.currentExp)} XP
          </span>
        </div>

        <div className="level-tile-gauge">
          <Gauge
            activeFill={colors.accent}
            centerValue={levelData.level}
            defaultLabel={`${percent}%`}
            height={gaugeHeight}
            inactiveFill={colors.textMuted}
            value={percent}
            width={gaugeWidth}
          />
        </div>

        <div className="level-tile-footer">
          <span className="level-tile-progress">
            {xpFormat.format(levelExp)}
            <span className="level-tile-progress-max">
              {' '}
              / {xpFormat.format(levelExpTotal)} XP
            </span>
          </span>
          <span className="level-tile-next">
            {xpFormat.format(expToNext)} XP to lvl {levelData.level + 1}
          </span>
        </div>
      </div>
    </Tile>
  );
}
