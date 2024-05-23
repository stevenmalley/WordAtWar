import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Vocabble } from './features/components/Vocabble';
import { Tile } from './features/components/Tile';
import { selectTiles } from './features/components/tileSlice';
import { setMouseCoords } from './features/components/mouseSlice';
import './App.css';

function App() {
  
  const tiles = useSelector(selectTiles);
  const dispatch = useDispatch();

  const selectedTile = tiles.find(tile => tile.selected);

  function mousemoveHandler(event) {
    dispatch(setMouseCoords(event.pageX,event.pageY));
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
