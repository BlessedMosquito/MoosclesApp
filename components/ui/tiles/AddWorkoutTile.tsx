'use client';

import AddIcon from '@/components/icons/AddIcon';
import Tile from './Tile';

type Props = {
  tileWidth: number;
  tileHeight: number;
};

export default function AddWorkoutTile({ tileWidth, tileHeight }: Props) {
  return (
    <Tile width={tileWidth} height={tileHeight}>
      <div>
        <section
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <p>{'Add wrokout'}</p>

          <AddIcon></AddIcon>
        </section>
      </div>
    </Tile>
  );
}
