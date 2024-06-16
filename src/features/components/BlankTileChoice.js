import { useSelector, useDispatch } from 'react-redux';
import { selectTiles, blankChoice } from '../store/tileSlice';


// Whenever a blank has a position on the board but no letter, BlankTileChoice should be displayed to allow a letter to be chosen

export function BlankTileChoice() {

  const tiles = useSelector(selectTiles);
  const dispatch = useDispatch();

  const blank = tiles.find(tile => tile.location === "board" && !tile.letter && !tile.blankLetter);// !blanks.find(blank => blank.id === tile.id));
  
  function handleClick(letter) {
    dispatch(blankChoice(blank.id,letter));
  }

  return (
    <div className="BlankTileChoice-modal WordAtWar-modal" style={{display:blank? "block" : "none"}}>
      <div className="BlankTileChoice-buttons WordAtWar-modalWindow">
        {
          Array(26).fill(null).map((_,i) => <button key={`BlankTileChoice-${i}`} onClick={e => handleClick(String.fromCharCode(65+i))}>
            {String.fromCharCode(65+i)}
          </button>)
        }
      </div>
    </div>
  );
}