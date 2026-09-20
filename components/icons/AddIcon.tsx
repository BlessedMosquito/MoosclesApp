import { IconProps } from '@/types/common';

export default function AddIcon({
  size = 20,
  color = 'currentColor',
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 14 14"
      id="Add-1--Streamline-Core"
      height={size}
      width={size}
    >
      <g id="add-1--expand-cross-buttons-button-more-remove-plus-add-+-mathematics-math">
        <path
          id="Vector"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 0.5v13"
          strokeWidth={1}
        />
        <path
          id="Vector_2"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M0.5 6.95996h13"
          strokeWidth={1}
        />
      </g>
    </svg>
  );
}
