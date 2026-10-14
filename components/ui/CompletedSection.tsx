import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';

export default function CompletedSection() {
  const { scale } = useResponsive();
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: s(12, scale),
        borderRadius: s(14, scale),
        border: `1px solid ${colors.accentBorder}`,
        background: colors.accentSurface,
        color: colors.accentLight,
        fontSize: s(fontSizes.bodySmall, scale),
        fontWeight: 700,
      }}
    >
      Completed!
    </div>
  );
}
