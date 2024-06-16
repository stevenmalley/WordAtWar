import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Tile } from './Tile';
import { selectTiles } from '../store/tileSlice';
import { setMouseCoords, setDisplacedPlayerTile, selectMouse } from '../store/mouseSlice';

export function SelectedTileOverlay() {
  
  const tiles = useSelector(selectTiles);
  const { coords, displacement } = useSelector(selectMouse);
  const dispatch = useDispatch();

  const selectedTile = tiles.find(tile => tile.selected);

  function mousemoveHandler(e) {

    console.log(e.type);

    if (e.type === "touchmove") e = e.changedTouches[0];

    dispatch(setMouseCoords(e.clientX,e.clientY));

    if (e.clientY > document.querySelector('.PlayerTiles').getBoundingClientRect().top) {
      // place tile in Player Tiles
      let playerTiles = document.querySelectorAll(".PlayerTiles .tile");
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
      onMouseMove={selectedTile? mousemoveHandler : null}
      onTouchMove={selectedTile? mousemoveHandler : null}
      style={{pointerEvents: selectedTile? "auto" : "none"}}
      >
      {
        selectedTile? <Tile data={selectedTile} mouseCoords={coords} /> : null
      }
    </div>
  );
}
