import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from './userSlice';
import { returnTile, selectTiles } from './tileSlice';
import { clearBlankChoice } from './blanksSlice';
import { Tile } from './Tile';


export function PlayerTiles() {

  const { playerID } = useSelector(selectUser);
  const tiles = useSelector(selectTiles);
  const playerTiles = tiles.filter(tile => tile.location === playerID).sort((a,b) => a.position - b.position);

  return (
    <div className="VocabblePlayerTiles">
      {
        playerTiles.map((tile,t) =>
          <div key={`playerTileHolder-${t}`} className="playerTileHolder">
            <Tile key={`playerTile-${t}`} index={t} data={tile} />
          </div>
        )
      }
      {
        Array(7-playerTiles.length).fill(null).map((_,t) =>
          <div key={`playerTileHolder-${t+playerTiles.length}`}></div>
        )
      }
    </div>
  );
}