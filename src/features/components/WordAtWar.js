import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, setCurrentGame, setUser } from '../store/userSlice';
import { selectGame } from '../store/gameSlice';
import { selectBoard } from '../store/boardSlice';
import { selectTiles } from '../store/tileSlice';
import { BoardSpace } from './BoardSpace';
import { PlayerTiles } from './PlayerTiles';
import { BlankTileChoice } from './BlankTileChoice';
import { QuizChoice } from './QuizChoice';
import { MessageModal } from './MessageModal';
import { GameControls } from './GameControls';
import { loadGameData } from '../../utilities/utils';
import { setBoardRendered } from '../store/boardRenderedSlice';
import serverPath from '../../serverPath';



export function WordAtWar() {
  const { name : username, playerID, currentGameID } = useSelector(selectUser);
  const game = useSelector(selectGame);
  const board = useSelector(selectBoard);
  const tiles = useSelector(selectTiles);
  const dispatch = useDispatch();
  const [ updateIntervals, setUpdateIntervals ] = useState([]);

  useEffect(() => {
    if (tiles.length > 0) {
      let clientTilePositions = JSON.parse(localStorage.getItem(`WordAtWar-game${game.id}-player${playerID}-clientTilePositions`));
      if (!clientTilePositions) clientTilePositions = [];
      tiles.filter(tile => !tile.locked).forEach(tile => {
        let clientTile = clientTilePositions.find(ct => ct.id === tile.id);
        if (clientTile) {
          if (tile.location !== "selected") {
            clientTile.location = tile.location;
            clientTile.position = tile.position;
            clientTile.blankLetter = tile.blankLetter;
          } // ignore changes to selected tiles (while a tile is selected, clientTilePosition should stay as it previously was)
        } else {
          const { id, location, position, blankLetter } = tile;
          clientTilePositions.push({id, location, position, blankLetter});
        }
      });

      clientTilePositions = clientTilePositions.filter(ct => tiles.find(tile => tile.id === ct.id && !tile.locked));
      localStorage.setItem(`WordAtWar-game${game.id}-player${playerID}-clientTilePositions`,JSON.stringify(clientTilePositions));
    }
  }, [tiles]);
  

  // get game data
  useEffect(() => {
    if (currentGameID) {
      async function fetchGame() {
        const response = await fetch(serverPath+`/php/getGameData.php?gameID=${currentGameID}&playerID=${playerID}`);
        //console.log(response.text());
        const gameData = await response.json();
        loadGameData(dispatch,gameData,playerID);
      }
      fetchGame();
    }
  },[playerID,currentGameID]);


  // check for updates (when the opponent has made a move)
  useEffect(() => {
    updateIntervals.forEach(intID => {
      clearInterval(intID);
    });

    if (currentGameID && game.id === currentGameID && game["player"+game.activePlayer] !== playerID) {
      const intervalID = setInterval(
        async () => {
          
            console.log("checking for updates");
            const response = await fetch(serverPath+`/php/getGameData.php?gameID=${game.id}&playerID=${playerID}`);
            //console.log(response.text());
            const gameData = await response.json();

            if (gameData.game["player"+gameData.game.activePlayer] !== game["player"+game.activePlayer]) {
              loadGameData(dispatch,gameData,playerID);
              console.log("loading updates");
            }
          }, 5000);
      setUpdateIntervals([intervalID]);
    }
  },[game]);

  let secretClicks = 0;
  function switchUser() {
    console.log("click");
    if (secretClicks === 2) {
      console.log("switch");
      dispatch(setUser({currentGameID, playerID:2, name:"TestPlayer2"}));
    } else secretClicks++;
  }

  function seeOtherGames() {
    dispatch(setCurrentGame(null));
  }


  // re-render after the board has rendered to allow player tiles to be located
  useEffect(() => {
    if (game.width && document.getElementsByClassName("boardSpace").length === game.width*game.width) {
      dispatch(setBoardRendered());
    }
  },[game]);

  return (
    <div className={"WordAtWar"+(game["player"+game.activePlayer] === playerID ? " activePlayer" : "")}>
      <div className="Wrapper">
        <div className="User">{username}<span><button onClick={seeOtherGames}>see other games</button></span></div>
        <div className="GameInfo">
          <span className={game.activePlayer === 1 ? "activePlayer" : ""}>{game.player1name} &ndash; {game.player1score}</span>
          <span className={game.activePlayer === 2 ? "activePlayer" : ""}>{game.player2name} &ndash; {game.player2score}</span>
        </div>
        <div className="WordAtWarBoard">
          <BlankTileChoice />
          <QuizChoice />
          <MessageModal />
          {
            board.map((boardRow,r) =>
              <div key={"boardRow"+r} className="boardRow">
                {
                  boardRow.map((boardSquare,c) => {
                    const tile = tiles.find(tile => tile.locked && Math.floor((tile.position-1)/15) === r && (tile.position-1)%15 === c);
                    return <BoardSpace key={`boardSquare${r}-${c}`} data={boardSquare} tile={tile} />
                  })
                }
              </div>
            )
          }
        </div>
        <PlayerTiles />
        <div className="BagCount"><span style={{fontWeight:"bold"}}>{game.bag}</span><br />TILES<br />REMAININ<span style={{position:"relative",zIndex:"1000"}} onClick={switchUser}>G</span></div>
        <GameControls />
      </div>
    </div>
  );
}