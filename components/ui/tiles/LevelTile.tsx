import { s, useResponsive } from '@/lib/useResponsive';
import Tile from './Tile';
import { colors } from '@/theme/colors';
import ProgressBar from '../ProgressBar';
import { fontSizes } from '@/theme/typography';
import { ReturnGetUserData } from '@/services/userData';
import { getLevelProgress } from '@/lib/helpers';

export default function LevelTile({
  experience,
  tileWidth,
  tileHeight,
}: ReturnGetUserData & { tileWidth: number; tileHeight: number }) {
  const { isMobile, scale } = useResponsive();

  const levelData = getLevelProgress(experience);
  const circleSize = s(isMobile ? 60 : 90, scale);

  return (
    <Tile width={tileWidth} height={tileHeight}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
          gap: s(12, scale),
        }}
      >
        <p
          style={{
            margin: 0,
            color: colors.text,
            fontWeight: 700,
          }}
        >
          Level
        </p>
        {/* kółko z levelem */}
        <div
          style={{
            width: circleSize,
            height: circleSize,
            borderRadius: '50%',
            border: `2px solid ${colors.accentDark}`,
            background: colors.transparent,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: s(2, scale),
          }}
        >
          <span
            style={{
              fontSize: s(isMobile ? 20 : 26, scale),
              fontWeight: 800,
              color: colors.text,
              lineHeight: 1,
            }}
          >
            {levelData.level}
          </span>
        </div>

        {/* exp info */}
        <p
          style={{
            margin: 0,
            fontSize: s(fontSizes.bodySmall, scale),
            color: colors.text,
          }}
        >
          {Math.round(levelData.progress * 100)}%
        </p>

        {/* progress bar */}
        <div style={{ width: tileWidth * 0.8 }}>
          <ProgressBar
            value={levelData.currentExp}
            progress={levelData.progress}
            color={colors.accent}
            labelLeft={''}
            labelRight={''}
            showLabels={false}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: s(6, scale),
              fontSize: s(fontSizes.caption, scale),
              fontWeight: 700,
              color: colors.text,
            }}
          >
            <span>lvl {levelData.level}</span>
            <span>lvl {levelData.level + 1}</span>
          </div>
        </div>
      </div>
    </Tile>
  );
}
