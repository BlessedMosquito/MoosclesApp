'use client';

import { useId } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { spring } from '@/lib/motion';

type TabOption<T extends string> = {
  value: T;
  label: string;
};

type TabsProps<T extends string> = {
  tabs: TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

export default function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: TabsProps<T>) {
  const indicatorId = useId();

  return (
    <div role="tablist" className="tabs">
      {tabs.map((tab) => {
        const isActive = tab.value === value;

        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={cn('tab', isActive && 'tab-active')}
          >
            {isActive && (
              <motion.span
                layoutId={indicatorId}
                transition={spring}
                className="tab-indicator"
              />
            )}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
