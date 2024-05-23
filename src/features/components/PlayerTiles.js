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
  const dispatch = useDispatch();

  return (
    <div className="VocabblePlayerTiles">
      {
        playerTiles.map((tile,t) =>
          <Tile key={`playerTile-${t}`} index={t} data={tile} />
        )
      }
    </div>
  );
}