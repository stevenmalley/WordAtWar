import { useSelector, useDispatch } from 'react-redux';
import { selectGame, setMessage } from '../store/gameSlice';

export function MessageModal() {

  const { message } = useSelector(selectGame);
  const dispatch = useDispatch();
  
  function clearMessage() {
    dispatch(setMessage(""));
  }

  return (
    <div className="Message-modal WordAtWar-modal" style={{display:message? "flex" : "none"}}>
      <div className="Message-display WordAtWar-modalWindow">
        {message}
        <div>
          <button className="submitButton" onClick={clearMessage}>OK</button>
        </div>
      </div>
    </div>
  );
}