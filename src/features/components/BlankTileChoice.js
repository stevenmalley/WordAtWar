import { useSelector, useDispatch } from 'react-redux';
import { chooseLetter, selectBlanks } from './blanksSlice';
import { placeTile } from './tileSlice';


// Whenever a blank has a position but no letter, BlankTileChoice should be displayed to allow a letter to be chosen

export function BlankTileChoice() {

  const blanks = useSelector(selectBlanks);
  const dispatch = useDispatch();

  const selectedBlank = blanks.find(blank => !blank.letter);
  
  function handleClick(letter) {
    dispatch(chooseLetter(selectedBlank.id,letter));
    dispatch(placeTile(selectedBlank.id,selectedBlank.position));
  }

  return (
    <div className="BlankTileChoice-modal" style={{display:selectedBlank? "block" : "none"}}>
      <div className="BlankTileChoice-buttons">
        {
          Array(26).fill(null).map((_,i) => <button key={`BlankTileChoice-${i}`} onClick={e => handleClick(String.fromCharCode(65+i))}>
            {String.fromCharCode(65+i)}
          </button>)
        }
      </div>
    </div>
  );
}