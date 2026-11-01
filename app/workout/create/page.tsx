'use client';

import { IconPlus, IconTemplate } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/ui/buttons/BackButton';
import ChoiceTile from '@/components/ui/tiles/ChoiceTile';
import TopBar from '@/components/ui/topBar/TopBar';

export default function CreateWorkoutPage() {
  const router = useRouter();

  return (
    <main className="page page-padded">
      <div className="page-content page-content-narrow">
        <TopBar
          left={<BackButton onClick={() => router.push('/dashboard')} />}
          center="New workout"
        />

        <p className="wizard-heading">How do you want to start?</p>

        <div className="choice-grid">
          <ChoiceTile
            icon={IconPlus}
            label="Create new workout"
            onClick={() => router.push('/workout/new/subgroup')}
          />
          <ChoiceTile
            icon={IconTemplate}
            label="Create from template"
            index={1}
            onClick={() => router.push('/workout/create/template')}
          />
        </div>
      </div>
    </main>
  );
}
