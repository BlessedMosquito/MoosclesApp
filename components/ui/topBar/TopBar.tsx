export default function BottomBar({ children }: { children: React.ReactNode }) {
  return (
    <nav
      style={{
        position: 'fixed',

        display: 'flex',
        gap: 8,

        padding: 10,
        background: 'rgba(0,0,0,0.3)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
    >
      {children}
    </nav>
  );
}
