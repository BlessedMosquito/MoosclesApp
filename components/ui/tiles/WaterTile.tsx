'use client';

import Tile from './Tile';

type Props = {
  tileWidth: number;
  tileHeight: number;
};

export default function WaterTile({ tileWidth, tileHeight }: Props) {
  return (
    <Tile width={tileWidth} height={tileHeight}>
      <div>
        <p>daily water intake: 0l</p>
      </div>
    </Tile>
  );
}
