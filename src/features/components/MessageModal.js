import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../store/userSlice';
import { selectGame, setMessage } from '../store/gameSlice';
import { loadGameData } from '../../utilities/utils';
import serverPath from '../../serverPath';

export function MessageModal() {

  const { message } = useSelector(selectGame);
  const { playerID, currentGameID } = useSelector(selectUser);
  const dispatch = useDispatch();
  
  function clearMessage() {
    dispatch(setMessage(""));
  }

  let messageText = message;
  let submitEffect = clearMessage;
  let cancelOption = false;
  
  if (message && message.startsWith("!PASS")) {

    messageText = "Are you sure you want to pass?";
    if (message === "!PASS-ENDGAME") messageText += " This will end the game (three passes in a row)!";

    submitEffect = async () => {
      const response = await fetch(serverPath+'/php/submitPass.php',
          {method: "POST",
          headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
          body: JSON.stringify({playerID, gameID:currentGameID})});
        const gameData = await response.json();
        if (gameData.status?.name === "failure") dispatch(setMessage(gameData.status.message));
        else loadGameData(dispatch,gameData,playerID,false);
    }

    cancelOption = true;
  }

  return (
    <div className="Message-modal WordAtWar-modal" style={{display:message? "flex" : "none"}}>
      <div className="Message-display WordAtWar-modalWindow">
        {messageText}
        <div>
          <button className="submitButton" onClick={submitEffect}>OK</button>
          {
            cancelOption?
            <button className="submitButton" onClick={clearMessage}>CANCEL</button> :
            null
          }
        </div>
      </div>
    </div>
  );
}