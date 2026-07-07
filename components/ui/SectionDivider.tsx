import { useResponsive, s } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';

type SectionDividerProps = {
  label: string;
};

export default function SectionDivider({ label }: SectionDividerProps) {
  const { scale } = useResponsive();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: s(12, scale),
        margin: `${s(24, scale)}px 0`,
      }}
    >
      <div
        style={{
          flex: 1,
          height: 1,
          background: colors.text,
        }}
      />

      <span
        style={{
          color: colors.text,
          fontSize: s(fontSizes.caption, scale),
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>

      <div
        style={{
          flex: 1,
          height: 1,
          background: colors.text,
        }}
      />
    </div>
  );
}
