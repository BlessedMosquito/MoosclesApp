import { cn } from '@/lib/utils';
import { BACK_SHAPES, BodyPart, FRONT_SHAPES } from './bodyShapes';
import { getMuscleHighlight } from './muscleParts';

type MuscleIconProps = {
  muscle: string;
  size?: number;
  className?: string;
};

export default function MuscleIcon({
  muscle,
  size = 72,
  className,
}: MuscleIconProps) {
  const { parts, view } = getMuscleHighlight(muscle);
  const shapes = view === 'back' ? BACK_SHAPES : FRONT_SHAPES;
  const highlighted = new Set<BodyPart>(parts);

  return (
    <svg
      viewBox="0 0 100 200"
      height={size}
      width={size / 2}
      aria-hidden="true"
      className={cn('muscle-icon', className)}
    >
      {shapes.map((shape) =>
        shape.points.map((points) => (
          <polygon
            key={points}
            points={points}
            className={cn(
              'muscle-icon-part',
              highlighted.has(shape.part) && 'muscle-icon-active'
            )}
          />
        ))
      )}
    </svg>
  );
}
