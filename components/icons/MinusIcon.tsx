import { IconProps } from '@/types/common';

export default function MinusIcon({
  size = 20,
  color = 'currentColor',
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 14 14"
      height={size}
      width={size}
    >
      <path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M0.5 6.95996h13"
        strokeWidth={1}
      />
    </svg>
  );
}
