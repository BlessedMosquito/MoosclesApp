import { IconProps } from "@/types/common";



export default function HomeIcon({ size = 20, color = 'currentColor' }: IconProps){
    return(
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14" height={size} width={size}>
    <g id="home-4--home-house-roof-shelter">
        <path id="Vector" stroke={color} strokeLinecap="round" strokeLinejoin="round" d="M0.5 8 7 1.5 13.5 8" strokeWidth="1"></path>
        <path id="Vector_2" stroke={color} strokeLinecap="round" strokeLinejoin="round" d="m2.5 6 0 6.5h9V6" strokeWidth="1"></path>
    </g>
    </svg>
)}