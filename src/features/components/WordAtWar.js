import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, setCurrentGame } from './userSlice';
import { selectGame } from './gameSlice';
import { selectBoard } from './boardSlice';
import { selectTiles } from './tileSlice';
import { BoardSpace } from './BoardSpace';
import { PlayerTiles } from './PlayerTiles';
import { BlankTileChoice } from './BlankTileChoice';
import { QuizChoice } from './QuizChoice';
import { GameControls } from './GameControls';
import { loadGameData } from './utils';
import { calculateScore } from './scoring';
import serverPath from '../../serverPath';



export function WordAtWar() {
  const { name : username, playerID, currentGameID } = useSelector(selectUser);
  const game = useSelector(selectGame);
  const board = useSelector(selectBoard);
  const tiles = useSelector(selectTiles);
  const dispatch = useDispatch();

  const placementScore = calculateScore(board,tiles);

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


  /** TESTING */
  useEffect(() => {
    async function fetchLatestGame() {
      const response = await fetch(serverPath+`/php/findLatestGame.php`);
      const json = await response.json();
      dispatch(setCurrentGame(json.gameID));
    }
    fetchLatestGame();
  },[]);
  

  
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


  

  return (
    <div className={"WordAtWar"+(game["player"+game.activePlayer] === playerID ? " activePlayer" : "")}>
      <div className="Wrapper">
        <div className="User">{username}</div>
        <div className="GameInfo">
          <span className={game.activePlayer === 1 ? "activePlayer" : ""}>{game.player1name} &ndash; {game.player1score}</span>
          <span className={game.activePlayer === 2 ? "activePlayer" : ""}>{game.player2name} &ndash; {game.player2score}</span>
        </div>
        <div className="WordAtWarBoard">
          <BlankTileChoice />
          <QuizChoice />
          {
            board.map((boardRow,r) =>
              <div key={"boardRow"+r} className="boardRow">
                {
                  boardRow.map((boardSquare,c) => {
                    const tile = tiles.find(tile => tile.location === "board" && Math.floor((tile.position-1)/15) === r && (tile.position-1)%15 === c);
                    const score = (!placementScore.error && placementScore.coord.row === r && placementScore.coord.col === c) ? placementScore.score : null;
                    return <BoardSpace key={`boardSquare${r}-${c}`} data={boardSquare} tile={tile} score={score} />
                  })
                }
              </div>
            )
          }
        </div>
        <PlayerTiles />
        <div className="BagCount"><span style={{fontWeight:"bold"}}>{game.bag}</span><br />TILES<br />REMAINING</div>
        <GameControls />
      </div>
    </div>
  );
}