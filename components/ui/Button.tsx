import { useResponsive } from "@/lib/useResponsive";
import { fontSizes } from "@/theme/typography";


type ButtonProps = {
    title: string;
    onClick?: () => void;
  };
  
  export default function Button({
    title,
    onClick,
  }: ButtonProps) {
    const {scale} = useResponsive();
    return (
      <button
        onClick={onClick}
        style={{
          height: 56 * scale,
          paddingLeft: 24 * scale,
          paddingRight: 24 * scale,
          borderRadius: 20,
          background: 'transparent',
          color: 'white',
          fontSize: fontSizes.button * scale,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.25s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.border =
            '5px solid rgba(255,255,255,0.5)';
  
          e.currentTarget.style.boxShadow =
            '0 8px 30px rgba(255,255,255,0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.border =
            '1px solid transparent';
  
          e.currentTarget.style.background =
            'transparent';
  
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {title}
      </button>
    );
  }
