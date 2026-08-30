import { s, useResponsive } from '@/lib/useResponsive';
import Tile from './Tile';
import { colors } from '@/theme/colors';
import ProgressBar from '../ProgressBar';
import { fontSizes } from '@/theme/typography';
import { ReturnGetUserData } from '@/services/userData';
import { useEffect, useState } from 'react';
import { getLevelProgress, GetLevelProgressType } from '@/lib/helpers';

export default function LevelTile(userData: ReturnGetUserData) {
  const { isMobile, scale } = useResponsive();

  const [levelData, setLevelData] = useState<GetLevelProgressType>({
    level: 0,
    currentExp: 0,
    currentLevelExp: 0,
    nextLevelExp: 0,
    progress: 0,
  });

  useEffect(() => {
    const response = getLevelProgress(userData.experience);
    setLevelData(response);
  }, [userData.experience]);

  const circleSize = s(isMobile ? 92 : 108, scale);

  return (
    <Tile width={350} height={250}>
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
        {/* kółko z levelem */}
        <div
          style={{
            width: circleSize,
            height: circleSize,
            borderRadius: '50%',
            border: `2px solid ${colors.border}`,
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
              fontSize: s(isMobile ? 28 : 36, scale),
              fontWeight: 800,
              color: colors.limeGreen,
              lineHeight: 1,
            }}
          >
            {levelData.level}
          </span>
          <span
            style={{
              fontSize: s(fontSizes.caption, scale),
              color: colors.textMuted,
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase' as const,
            }}
          >
            level
          </span>
        </div>

        {/* exp info */}
        <p
          style={{
            margin: 0,
            fontSize: s(fontSizes.caption, scale),
            color: colors.textMuted,
          }}
        >
          {levelData.currentExp} / {levelData.nextLevelExp} XP
        </p>

        {/* progress bar */}
        <div style={{ width: 350 * 0.8 }}>
          <ProgressBar
            value={levelData.currentExp}
            progress={levelData.progress}
            color={colors.limeGreen}
            labelLeft={''}
            labelRight={''}
            showLabels={false}
          />
        </div>
      </div>
    </Tile>
  );
}
