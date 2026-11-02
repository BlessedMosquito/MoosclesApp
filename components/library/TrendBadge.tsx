import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconMinus,
  IconSparkles,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { SessionTrend } from '@/services/exerciseStats';

const TREND_LABEL: Record<SessionTrend, string> = {
  up: 'Progress',
  down: 'Lower',
  same: 'Same',
  new: 'First',
};

const TREND_ICON = {
  up: IconArrowUpRight,
  down: IconArrowDownRight,
  same: IconMinus,
  new: IconSparkles,
};

export default function TrendBadge({
  trend,
  showLabel = false,
}: {
  trend: SessionTrend;
  showLabel?: boolean;
}) {
  const Icon = TREND_ICON[trend];

  return (
    <span
      title={TREND_LABEL[trend]}
      className={cn('trend-badge', `trend-badge-${trend}`)}
    >
      <Icon size={14} stroke={2.5} />
      {showLabel && TREND_LABEL[trend]}
    </span>
  );
}
