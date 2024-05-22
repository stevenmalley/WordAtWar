import { useSelector, useDispatch } from 'react-redux';
import { selectBoard } from './boardSlice';
import { placeTile, selectTiles } from './tileSlice';
import { placeBlank, selectBlanks } from './blanksSlice';
import { Tile } from './Tile';



export function BoardSpace({ row, col, data, tile }) {

  const board = useSelector(selectBoard);
  const tiles = useSelector(selectTiles);
  const blanks = useSelector(selectBlanks);
  const selectedTile = tiles.find(tile => tile.selected);
  const boardTiles = tiles.filter(tile => tile.location === "board");
  const blankLetter = (tile && tile.letter === null) ? blanks.find(blank => blank.id === tile.id).letter : null;
  const dispatch = useDispatch();

  function handleClick() {
    const position = row*board.length+col+1;
    if (selectedTile && !boardTiles.some(tile => tile.location === "board" && tile.position === position)) {
      if (selectedTile.letter !== null) {
        dispatch(placeTile(selectedTile.id,position));
      } else {
        dispatch(placeBlank(selectedTile.id,position));
      }
    }
  }


  return (
    <div className={"boardSpace"+(data.bonus? ` ${data.bonus}` : "")+(data.centre? " board-centre" : "")+(tile? " boardSpace-faded" : "")}
      onClick={handleClick}>
      {
        tile ? <Tile data={{...tile,blankLetter}} /> : null
      }
    </div>
  );
}