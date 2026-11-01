import ChevronIcon from '@/components/icons/ChevronIcon';
import { cn } from '@/lib/utils';

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
      className={cn('icon-btn', direction === 'back' && 'rotate-180')}
    >
      <ChevronIcon />
    </button>
  );
}
