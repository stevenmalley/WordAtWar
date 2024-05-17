import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from './userSlice';
import { getTiles, returnTile, selectTiles } from './tileSlice';
import { Tile } from './Tile';


export function GameControls() {

  const { playerID } = useSelector(selectUser);
  const tiles = useSelector(selectTiles);
  const placedTiles = tiles.filter(tile => tile.location === "board" && !tile.locked);
  const dispatch = useDispatch();

  //useEffect(()=>{dispatch(getTiles())},[]);

  function submit() {
    if (placedTiles.length > 0) {



      // const response = await fetch('http://localhost/vocabble/php/getGameData.php', {method: "POST", body: {playerID, gameID, tiles}});
      // return await response.json();


      dispatch()
    }

    // console.log("pt");
    // const selectedTile = tiles.find(tile => tile.selected);
    // if (selectedTile) {
    //   dispatch(returnTile(playerID,selectedTile.id));
    // }
  }

  return (
    <div className="GameControls">
      <button onClick={submit}>SAVE</button>
     </div>
  );
}