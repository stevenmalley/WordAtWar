import { selectTile } from './tileSlice';
import { useDispatch } from 'react-redux';

export function Tile({ data }) {

  const dispatch = useDispatch();
  const {letter, score, id, selected, locked, blankLetter} = data;

  function handleClick(id,event) {
    dispatch(selectTile(id));
    event.stopPropagation();
  }

  return (
    <div className={"playerTile"+(selected? " selected" : "")+(locked? " locked" : "")} onClick={locked? null : e => handleClick(id,e)}>
      <div className="playerTile-letter">{letter || blankLetter}</div>
      <div className="playerTile-score">{score || ""}</div>
    </div>
  );
}