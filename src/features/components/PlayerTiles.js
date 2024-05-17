import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from './userSlice';
import { getTiles, returnTile, selectTiles } from './tileSlice';
import { Tile } from './Tile';


export function PlayerTiles() {

  const { playerID } = useSelector(selectUser);
  const tiles = useSelector(selectTiles);
  const playerTiles = tiles.filter(tile => tile.location === playerID).sort((a,b) => a.position - b.position);
  const dispatch = useDispatch();

  //useEffect(()=>{dispatch(getTiles())},[]);

  function handleClick() {
    console.log("pt");
    const selectedTile = tiles.find(tile => tile.selected);
    if (selectedTile) {
      dispatch(returnTile(playerID,selectedTile.id));
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