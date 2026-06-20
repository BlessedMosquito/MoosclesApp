import {
  commmonIconColor,
  commonIconSize,
} from '@/app/constants/iconsConstants';
import { IconProps } from '@/types/common';

export default function ({
  size = commonIconSize,
  color = commmonIconColor,
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 14 14"
      id="Arrow-Up-1--Streamline-Core"
      height={size}
      width={size}
    >
      {' '}
      <g id="arrow-up-1--arrow-up-keyboard">
        <path
          id="Vector"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 13.5V0.5"
          strokeWidth="1"
        ></path>
        <path
          id="Vector_2"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.5 4 7 0.5 3.5 4"
          strokeWidth="1"
        ></path>
      </g>
    </svg>
  );
}
