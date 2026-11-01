'use client';

import { useRouter } from 'next/navigation';
import Button from '@/components/ui/buttons/Button';
import BottomDrawer from '@/components/ui/drawer/BottomDrawer';

type ProfileSetupPromptProps = {
  open: boolean;
  missingItems: string[];
  onClose: () => void;
};

const BODY_ITEMS = ['Age', 'Weight'];

export default function ProfileSetupPrompt({
  open,
  missingItems,
  onClose,
}: ProfileSetupPromptProps) {
  const router = useRouter();
  const tab = missingItems.some((item) => BODY_ITEMS.includes(item))
    ? 'body'
    : 'goals';

  return (
    <BottomDrawer open={open} onClose={onClose} title="Complete your profile">
      <div className="profile-prompt">
        <p className="profile-prompt-text">
          Set up these details to get accurate goals and progress tracking:
        </p>
        <ul className="profile-prompt-list">
          {missingItems.map((item) => (
            <li key={item} className="profile-prompt-item">
              {item}
            </li>
          ))}
        </ul>
        <div className="profile-prompt-actions">
          <Button
            onClick={() => {
              onClose();
              router.push(`/profile?tab=${tab}`);
            }}
            width="full"
          >
            Set up now
          </Button>
          <button
            type="button"
            onClick={onClose}
            className="profile-prompt-later"
          >
            Later
          </button>
        </div>
      </div>
    </BottomDrawer>
  );
}
