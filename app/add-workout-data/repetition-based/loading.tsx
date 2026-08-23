import LoadingCircle from '@/components/ui/feedback/LoadingCircle';

export default function Loading() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'transparent',
      }}
    >
      <LoadingCircle />
    </main>
  );
}
