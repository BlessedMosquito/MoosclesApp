import { ReactNode } from 'react';

type TileProps = {
  title: string;
  subtitle?: string;
  children?: ReactNode;
};

export default function Tile({
  title,
  subtitle,
  children,
}: TileProps) {
  return (
    <div
      style={{
        width: '100%',
        minHeight: 180,

        padding: 24,

        borderRadius: 32,

        background:
          'linear-gradient(to bottom right, rgba(255,255,255,0.10), rgba(255,255,255,0.04))',

        border: '1px solid rgba(255,255,255,0.08)',

        backdropFilter: 'blur(30px)',

        boxShadow:
          '0 10px 40px rgba(0,0,0,0.35)',

        color: 'white',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          {title}
        </h2>

        {subtitle && (
          <p
            style={{
              opacity: 0.6,
              fontSize: 14,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      <div
        style={{
          marginTop: 20,
        }}
      >
        {children}
      </div>
    </div>
  );
}