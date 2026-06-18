import { IconProps } from "@/types/common";


export default function DropDownIcon({ size = 20, color = 'currentColor' }: IconProps){
    return (
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14" id="Arrow-Bend-Right-Down-2--Streamline-Core" height={size} width={size}>
  <g id="arrow-bend-right-down-2--arrow-bend-curve-change-direction-right-to-down">
    <path id="Vector" stroke={color} strokeLinecap="round" strokeLinejoin="round" d="m11.5 10.5 -3 3 -3 -3" strokeWidth="1"></path>
    <path id="Vector_2" stroke={color} strokeLinecap="round" strokeLinejoin="round" d="M2.5 0.5h2c1.06087 0 2.07828 0.421427 2.82843 1.17157C8.07857 2.42172 8.5 3.43913 8.5 4.5v9" strokeWidth="1"></path>
  </g>
</svg>
)
}