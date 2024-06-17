import { WordAtWar } from './features/components/WordAtWar';
import { PlayerTileOverlay } from './features/components/PlayerTileOverlay';
import './App.css';

function App() {
  return (
    <div className="App">
      <PlayerTileOverlay />
      <WordAtWar />
    </div>
  );
}

export default App;
