import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, setCurrentGame } from './userSlice';
import { selectGame } from './gameSlice';
import { selectBoard } from './boardSlice';
import { selectTiles } from './tileSlice';
import { BoardSpace } from './BoardSpace';
import { PlayerTiles } from './PlayerTiles';
import { BlankTileChoice } from './BlankTileChoice';
import { GameControls } from './GameControls';
import { loadGameData } from './utils';
import { calculateScore } from './scoring';



export function Vocabble() {
  const { name : username, playerID, currentGameID } = useSelector(selectUser);
  const game = useSelector(selectGame);
  const board = useSelector(selectBoard);
  const tiles = useSelector(selectTiles);
  const dispatch = useDispatch();


  const placementScore = calculateScore(board,tiles);



  /** TESTING */
  useEffect(() => {
    async function fetchLatestGame() {
      const response = await fetch(`http://localhost/vocabble/php/findLatestGame.php`);
      const json = await response.json();
      dispatch(setCurrentGame(json.gameID));
    }
    fetchLatestGame();
  },[]);
  

  
  useEffect(() => {
    if (currentGameID) {
      async function fetchGame() {
        const response = await fetch(`http://localhost/vocabble/php/getGameData.php?gameID=${currentGameID}&playerID=${playerID}`);
        const gameData = await response.json();
        loadGameData(dispatch,gameData);
      }
      fetchGame();
    }
  },[playerID,currentGameID]);

  

  return (
    <div className={"Vocabble"+(game["player"+game.activePlayer] === playerID ? " activePlayer" : "")}>
      <div className="Wrapper">
        <div className="User">{username}</div>
        <h1>Word at War</h1>
        <div className="GameInfo">
          <span className={game.activePlayer === 1 ? "activePlayer" : ""}>{game.player1name} &ndash; {game.player1score}</span>
          <span className={game.activePlayer === 2 ? "activePlayer" : ""}>{game.player2name} &ndash; {game.player2score}</span>
        </div>
        <div className="VocabbleBoard">
          <BlankTileChoice />
          {
            board.map((boardRow,r) =>
              <div key={"boardRow"+r} className="boardRow">
                {
                  boardRow.map((boardSquare,c) => {
                    const tile = tiles.find(tile => tile.location === "board" && Math.floor((tile.position-1)/15) === r && (tile.position-1)%15 === c);
                    const score = (!placementScore.error && placementScore.coord.row === r && placementScore.coord.col === c) ? placementScore.score : null;
                    return <BoardSpace key={`boardSquare${r}-${c}`} data={boardSquare} tile={tile} boardWidth={game.width} score={score} />
                  })
                }
              </div>
            )
          }
        </div>
        <PlayerTiles />
        <div className="BagCount">Tiles remaining: {game.bag}</div>
        <GameControls />
      </div>
    </div>
  );
}