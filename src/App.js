import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { WordAtWar } from './features/components/WordAtWar';
import { PlayerTileOverlay } from './features/components/PlayerTileOverlay';
import { selectUser, setUser, setCurrentGame } from './features/store/userSlice';
import { wipeGameData } from './features/store/gameSlice';
import { wipeTileData } from './features/store/tileSlice';
import serverPath from './serverPath';
import './App.css';

function App() {
  const { name : username, playerID, currentGameID } = useSelector(selectUser);
  const dispatch = useDispatch();
  const [ playerGames, setPlayerGames ] = useState([]);
  const [ updateIntervals, setUpdateIntervals ] = useState([]);

  /** TESTING */
  useEffect(() => {
    async function fetchLatestGame() {
      const response = await fetch(serverPath+`/php/findLatestGame.php`);
      const json = await response.json();
      dispatch(setCurrentGame(json.gameID));
    }
    //fetchLatestGame();
  },[]);
  useEffect(() => {
    const parameters = window.location.search.slice(1).split('&').map(par => par.split('='));
    const login = parameters.find(par => par[0] === "playerID");
    if (login) {
      const loginID = parseInt(login[1]);
      dispatch(setUser({currentGameID, playerID:loginID, name:"TestPlayer"+loginID}));
    }
    else dispatch(setUser({currentGameID, playerID:1, name:"TestPlayer1"}));
  },[]);


  function loadGame(gameID) {
    dispatch(setCurrentGame(gameID));
  }

  async function startNewGame() {
    const response = await fetch(serverPath+'/php/setupGame.php',
      {method: "POST",
      headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
      body: JSON.stringify({playerIDs:[1,2], mode:"feud"})});
    const json = await response.json();
    dispatch(setCurrentGame(json.gameID));
  }


  // check for updates (when the opponent has made a move)
  useEffect(() => {
    updateIntervals.forEach(intID => {
      clearInterval(intID);
    });
    setUpdateIntervals([]);
  },[currentGameID]);


  useEffect(() => {
      
    if (playerID) {

      if (currentGameID) {

      } else {
        async function getPlayerGames() {
          const response = await fetch(serverPath+'/php/getPlayerGames.php',
            {method: "POST",
            headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
            body: JSON.stringify({playerID})});
          const jsonResponse = await response.json();

          let orderedGames = [];
          orderedGames = orderedGames.concat(jsonResponse.filter(game => !game.complete && game["player"+game.activePlayer] === playerID));
          orderedGames = orderedGames.concat(jsonResponse.filter(game => !game.complete && game["player"+game.activePlayer] !== playerID));
          orderedGames = orderedGames.concat(jsonResponse.filter(game => game.complete));
          setPlayerGames(orderedGames);
        }
        getPlayerGames();
      }

    }
  }, [playerID, currentGameID]);

  function seeOtherGames() {
    dispatch(wipeTileData());
    dispatch(wipeGameData());
    dispatch(setCurrentGame(null));
  }

  return (
    <div className="App">
      <div className="User">{username}{currentGameID? <span><button onClick={seeOtherGames}>see other games</button></span> : null}</div>
      {
        playerID ?

          currentGameID ?

            <div>
              <WordAtWar updateIntervals={updateIntervals} setUpdateIntervals={setUpdateIntervals} />
              <PlayerTileOverlay />
            </div> :

            <div>
              <div className="GameList">
                {
                  playerGames.map((game,i) => {
                    const gameStatus = game.complete?
                      {message: "GAME OVER", style: {fontWeight:"bold"}} :
                        game["player"+game.activePlayer] === playerID?
                          {message: "It's your turn!", style: {color:"red"}} :
                          {message: "", style: {}};

                    return <button key={`chooseGameButton_${i}`} onClick={() => loadGame(game.id)}>
                      <div>
                        <div className={game.activePlayer === 1? "chooseGameActive" : ""}>{game.player1name}</div>
                        <div className={game.activePlayer === 2? "chooseGameActive" : ""}>{game.player2name}</div>
                      </div>
                      <div>
                        <div>{game.player1score}</div>
                        <div>{game.player2score}</div>
                      </div>
                      <span style={gameStatus.style}>{gameStatus.message}</span>
                    </button>})
                }
              </div>
              <div><button onClick={startNewGame}>START NEW GAME</button></div>
            </div>

          :
        
        <div>register / login</div>
      }
    </div>
  );
}

export default App;
