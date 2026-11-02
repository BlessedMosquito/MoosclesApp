'use client';

import { IconAlertTriangle } from '@tabler/icons-react';
import Button from '../buttons/Button';

type QuestionPopUpProps = {
  text: string;
  onYes: () => void;
  onNo: () => void;
  title?: string;
  warning?: string;
  yesLabel?: string;
  noLabel?: string;
};

export default function QuestionPopUp({
  text,
  onYes,
  onNo,
  title,
  warning,
  yesLabel = 'Yes',
  noLabel = 'No',
}: QuestionPopUpProps) {
  return (
    <div onClick={onNo} className="overlay overlay-soft">
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="popup-card question-card"
      >
        {title && <p className="question-title">{title}</p>}
        <p className="question-text">{text}</p>

        {warning && (
          <div role="alert" className="question-warning">
            <IconAlertTriangle size={18} stroke={2} className="shrink-0" />
            <span>{warning}</span>
          </div>
        )}

        <div className="question-actions">
          <Button onClick={onNo}>{noLabel}</Button>
          <Button onClick={onYes}>{yesLabel}</Button>
        </div>
      </div>
    </div>
  );
}
