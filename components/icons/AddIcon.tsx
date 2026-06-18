import { IconProps } from "@/types/common";

  
export default function AddIcon({ size = 20, color = 'currentColor' }: IconProps) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14" width={size} height={size}>
            <g>
                <path id="Vector" stroke={color} strokeLinecap="round" strokeLinejoin="round" d="M7 4v6" strokeWidth="1"></path>
                <path id="Vector_2" stroke={color} strokeLinecap="round" strokeLinejoin="round" d="M4 7h6" strokeWidth="1"></path>
                <path id="Vector_3" stroke={color} strokeLinecap="round" strokeLinejoin="round" d="M10.5 0.5h-7c-1.65685 0 -3 1.34315 -3 3v7c0 1.6569 1.34315 3 3 3h7c1.6569 0 3 -1.3431 3 -3v-7c0 -1.65685 -1.3431 -3 -3 -3Z" strokeWidth="1"></path>
            </g>
        </svg>
    );
}