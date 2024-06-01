import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Tile } from './Tile';
import { selectTiles } from './tileSlice';
import { setMouseCoords, setDisplacedPlayerTile, selectMouse } from './mouseSlice';

export function SelectedTileOverlay() {
  
  const tiles = useSelector(selectTiles);
  const { coords, displacement } = useSelector(selectMouse);
  const dispatch = useDispatch();

  const selectedTile = tiles.find(tile => tile.selected);

  function mousemoveHandler(e) {
    dispatch(setMouseCoords(e.clientX,e.clientY));

    if (e.clientY > document.querySelector('.WordAtWarPlayerTiles').getBoundingClientRect().top) {
      // place tile in Player Tiles
      let playerTiles = document.querySelectorAll(".WordAtWarPlayerTiles .tile");
      let minDistance = Infinity;
      let closestPosition = 0;
      for (let i = 0; i < playerTiles.length; i++) {
        let rect = playerTiles[i].getBoundingClientRect();
        let d = Math.abs(e.clientX-rect.left);
        if (d < minDistance) {
          minDistance = d;
          closestPosition = i;
        }
        if (i === playerTiles.length-1 && Math.abs(e.clientX-rect.right) < minDistance) {
          closestPosition = i+1;
        }
      }
      dispatch(setDisplacedPlayerTile(closestPosition));
    } else if (displacement !== 7) dispatch(setDisplacedPlayerTile(7));
  }

  return (
    <div className="SelectedTileOverlay"
      onMouseMove={selectedTile? e => mousemoveHandler(e) : null}
      style={{pointerEvents: selectedTile? "auto" : "none"}}>
      {
        selectedTile? <Tile data={selectedTile} mouseCoords={coords} /> : null
      }
    </div>
  );
}
