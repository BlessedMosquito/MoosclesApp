import { IconProps } from '@/types/common';

export default function ChevronIcon({
  size = 20,
  color = 'currentColor',
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 14 14"
      width={size}
      height={size}
    >
      <path
        d="m4 1 6 6-6 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={color}
      />
    </svg>
  );
}
