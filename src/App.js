import React from 'react';
import { Vocabble } from './features/components/Vocabble';
import { SelectedTileOverlay } from './features/components/SelectedTileOverlay';
import './App.css';

function App() {
  

  return (
    <div className="App">
      <SelectedTileOverlay />
      <Vocabble />
    </div>
  );
}

export default App;
