import LoadingCircle from '@/components/ui/feedback/LoadingCircle';

export default function Loading() {
  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
      }}
    >
      <LoadingCircle />
    </div>
  );
}