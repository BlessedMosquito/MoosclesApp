'use client';

import Button from '../buttons/Button';

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
  return (
    <div onClick={onNo} className="overlay overlay-soft">
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="popup-card question-card"
      >
        <p className="question-text">{text}</p>

        <div className="question-actions">
          <Button onClick={onNo}>No</Button>
          <Button onClick={onYes}>Yes</Button>
        </div>
      </div>
    </div>
  );
}
