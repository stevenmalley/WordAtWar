import React from 'react';
import { WordAtWar } from './features/components/WordAtWar';
import { SelectedTileOverlay } from './features/components/SelectedTileOverlay';
import './App.css';

function App() {
  

  return (
    <div className="App">
      <SelectedTileOverlay />
      <WordAtWar />
    </div>
  );
}

export default App;
