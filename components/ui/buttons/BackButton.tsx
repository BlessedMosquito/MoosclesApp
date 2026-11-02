import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

type BackButtonProps = {
  onClick: () => void;
  label?: string;
  direction?: 'back' | 'forward';
  disabled?: boolean;
};

export default function BackButton({
  onClick,
  label = 'Back',
  direction = 'back',
  disabled,
}: BackButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="back-btn"
    >
      {direction === 'back' ? (
        <IconChevronLeft size={20} stroke={2.25} />
      ) : (
        <IconChevronRight size={20} stroke={2.25} />
      )}
    </button>
  );
}
