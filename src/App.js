import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Vocabble } from './features/components/Vocabble';
import { Tile } from './features/components/Tile';
import { selectTiles } from './features/components/tileSlice';
import { setMouseCoords, setDisplacedPlayerTile, selectMouse } from './features/components/mouseSlice';
import './App.css';

function App() {
  
  const tiles = useSelector(selectTiles);
  const { displacement } = useSelector(selectMouse);
  const dispatch = useDispatch();

  const selectedTile = tiles.find(tile => tile.selected);

  function mousemoveHandler(e) {
    dispatch(setMouseCoords(e.pageX,e.pageY));

    if (e.clientY > document.querySelector('.VocabblePlayerTiles').getBoundingClientRect().top) {
      // place tile in Player Tiles
      let playerTiles = document.querySelectorAll(".VocabblePlayerTiles .tile");
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
    <div className="App" onMouseMove={selectedTile? e => mousemoveHandler(e) : null}>
      <Vocabble />
      <div className="SelectedTileOverlay">
        {
          selectedTile? <Tile data={selectedTile} /> : null
        }
      </div>
    </div>
  );
}

export default App;
