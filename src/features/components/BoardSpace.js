import { useSelector, useDispatch } from 'react-redux';
import { selectBoard } from './boardSlice';
import { placeTile, selectTiles } from './tileSlice';
import { Tile } from './Tile';



export function BoardSpace({ row, col, data, tile }) {

  const board = useSelector(selectBoard);
  const tiles = useSelector(selectTiles);
  const selectedTile = tiles.find(tile => tile.selected);
  const boardTiles = tiles.filter(tile => tile.location === "board");
  const dispatch = useDispatch();

  function handleClick() {
    console.log(row,col);
    const position = (row-1)*board.length+col;
    if (selectedTile && !boardTiles.some(tile => tile.location === "board" && tile.position === position)) {
      console.log(selectedTile);
      dispatch(placeTile(selectedTile.id,position));
    }
  }


  return (
    <div className={"boardSpace"+(data.bonus? ` ${data.bonus}` : "")+(data.centre? " board-centre" : "")+(tile? " boardSpace-faded" : "")}
      onClick={handleClick}>
      {
        tile ? <Tile data={tile} /> : null
      }
      {/* <div className="boardSpace-letter">{data.letter}</div>
      <div className="boardSpace-score">{data.score}</div> */}
    </div>
  );
}