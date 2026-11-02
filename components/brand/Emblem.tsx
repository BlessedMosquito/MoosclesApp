import { EMBLEM_PATH } from './LogoV2';

type EmblemProps = {
  size?: number;
  className?: string;
};

export default function Emblem({ size = 96, className }: EmblemProps) {
  return (
    <svg
      viewBox="-8 -8 326 310"
      width={size}
      height={(size * 310) / 326}
      aria-hidden="true"
      className={className}
    >
      <path fill="var(--accent)" fillRule="evenodd" d={EMBLEM_PATH} />
    </svg>
  );
}
