'use client';

import { Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import ExercisesTab from '@/components/library/ExercisesTab';
import TemplatesTab from '@/components/library/TemplatesTab';
import WorkoutsTab from '@/components/library/WorkoutsTab';
import Tabs from '@/components/ui/tabs/Tabs';
import { fade } from '@/lib/motion';

type LibraryTab = 'workouts' | 'exercises' | 'templates';

const LIBRARY_TABS: { value: LibraryTab; label: string }[] = [
  { value: 'workouts', label: 'Workouts' },
  { value: 'exercises', label: 'Exercises' },
  { value: 'templates', label: 'Templates' },
];

const SUBTITLES: Record<LibraryTab, string> = {
  workouts: 'Every workout you have logged.',
  exercises: 'Track how your lifts progress over time.',
  templates: 'Ready-made strength workouts.',
};

function isLibraryTab(value: string | null): value is LibraryTab {
  return LIBRARY_TABS.some((tab) => tab.value === value);
}

function LibraryContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: LibraryTab = isLibraryTab(tabParam) ? tabParam : 'workouts';

  function changeTab(tab: LibraryTab) {
    router.replace(`${pathname}?tab=${tab}`, { scroll: false });
  }

  return (
    <main className="page page-padded">
      <div className="page-content page-content-narrow">
        <header className="library-header">
          <h1 className="page-title">Library</h1>
          <p className="library-subtitle">{SUBTITLES[activeTab]}</p>
        </header>

        <Tabs tabs={LIBRARY_TABS} value={activeTab} onChange={changeTab} />

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={fade}
            className="mt-5"
          >
            {activeTab === 'workouts' && <WorkoutsTab />}
            {activeTab === 'exercises' && <ExercisesTab />}
            {activeTab === 'templates' && <TemplatesTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={null}>
      <LibraryContent />
    </Suspense>
  );
}
