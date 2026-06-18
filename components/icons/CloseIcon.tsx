import { IconProps } from "@/types/common";


export default function CloseIcon({size = 20, color = 'currentColor'}: IconProps){
    return(
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14" id="Delete-1--Streamline-Core" height={size}width={size}>
            <g id="delete-1--remove-add-button-buttons-delete-cross-x-mathematics-multiply-math">
                <path id="Vector" stroke={color} strokeLinecap="round" strokeLinejoin="round" d="m13.5 0.5 -13 13" strokeWidth="1"></path>
                <path id="Vector_2" stroke={color} strokeLinecap="round" strokeLinejoin="round" d="m0.5 0.5 13 13" strokeWidth="1"></path>
            </g>
        </svg>
    )
}

