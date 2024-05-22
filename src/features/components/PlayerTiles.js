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

  function handleClick() {
    const selectedTile = tiles.find(tile => tile.selected);
    if (selectedTile) {
      dispatch(returnTile(playerID,selectedTile.id));
      if (selectedTile.letter === null) {
        dispatch(clearBlankChoice(selectedTile.id));
      }
    }
  }

  return (
    <div className="VocabblePlayerTiles" onClick={handleClick}>
      {
        playerTiles.map((tile,t) =>
          <Tile key={`playerTile-${t}`} index={t} data={tile} />
        )
      }
    </div>
  );
}