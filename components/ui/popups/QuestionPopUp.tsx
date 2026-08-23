'use client';

import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';
import Button from '../Button';

type QuestionPopUpProps = {
  text: string;
  onYes: () => void;
  onNo: () => void;
};

export default function QuestionPopUp({
  text,
  onYes,
  onNo,
}: QuestionPopUpProps) {
  const { scale } = useResponsive();

  return (
    <div
      onClick={onNo}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: s(24, scale),
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: s(320, scale),
          borderRadius: s(20, scale),
          border: `1px solid ${colors.border}`,
          background: colors.componentsBg,
          boxShadow: '0 16px 48px rgba(0,0,0,0.8)',
          padding: s(24, scale),
          display: 'flex',
          flexDirection: 'column',
          gap: s(20, scale),
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: s(fontSizes.body, scale),
            color: colors.text,
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          {text}
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: s(10, scale),
          }}
        >
          <Button onClick={onNo}>{'No'}</Button>

          <Button onClick={onYes}>{'Yes'}</Button>
        </div>
      </div>
    </div>
  );
}
