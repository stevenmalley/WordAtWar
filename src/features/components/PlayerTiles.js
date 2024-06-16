import { useSelector } from 'react-redux';
import { selectUser } from '../store/userSlice';
import { selectTiles } from '../store/tileSlice';
import { selectMouse } from '../store/mouseSlice';
import { Tile } from './Tile';


export function PlayerTiles() {

  const { playerID } = useSelector(selectUser);
  const { displacement } = useSelector(selectMouse);
  const tiles = useSelector(selectTiles);
  const playerTiles = tiles.filter(tile => tile.location === playerID).sort((a,b) => a.position - b.position); // excludes selected tile (location == "selected")

  return (
    <div className="PlayerTiles">
      {
        playerTiles.map((tile,t) =>
          <div key={`playerTileHolder-${t}`} className="playerTileHolder">
            <Tile key={`playerTile-${t}`} index={t} data={tile} displaced={t >= displacement} />
          </div>
        )
      }
      {
        Array(7-playerTiles.length).fill(null).map((_,t) =>
          <div key={`playerTileHolder-${t+playerTiles.length}`}></div>
        )
      }
    </div>
  );
}