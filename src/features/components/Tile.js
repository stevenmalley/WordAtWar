import { selectTile } from './tileSlice';
import { useDispatch } from 'react-redux';

export function Tile({ data }) {

  const dispatch = useDispatch();
  const {letter, score, id, selected, locked} = data;

  function handleClick(id,event) {
    console.log("tile",id);
    dispatch(selectTile(id));
    event.stopPropagation();
  }

  return (
    <div className={"playerTile"+(selected? " selected" : "")+(locked? " locked" : "")} onClick={locked? null : e => handleClick(id,e)}>
      <div className="playerTile-letter">{letter}</div>
      <div className="playerTile-score">{score}</div>
    </div>
  );
}