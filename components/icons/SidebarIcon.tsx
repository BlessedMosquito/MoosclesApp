import {
  commmonIconColor,
  commonIconSize,
} from '@/app/constants/iconsConstants';
import { IconProps } from '@/types/common';

export default function SidebarIcon({
  size = commonIconSize,
  color = commmonIconColor,
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 14 14"
      id="Equal-Sign--Streamline-Core"
      height={size}
      width={size}
    >
      <g id="equal-sign--interface-math-equal-sign-mathematics">
        <path
          id="Vector 267"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M0.75 2.5h12.5"
          strokeWidth="1"
        ></path>
        <path
          id="Vector 268"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M0.75 7h12.5"
          strokeWidth="1"
        ></path>
        <path
          id="Vector 269"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M0.75 11.5h12.5"
          strokeWidth="1"
        ></path>
      </g>
    </svg>
  );
}
