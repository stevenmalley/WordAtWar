import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, setCurrentGame } from './userSlice';
import { selectGame } from './gameSlice';
import { selectBoard } from './boardSlice';
import { selectTiles } from './tileSlice';
import { selectBlanks } from './blanksSlice';
import { BoardSpace } from './BoardSpace';
import { PlayerTiles } from './PlayerTiles';
import { BlankTileChoice } from './BlankTileChoice';
import { GameControls } from './GameControls';
import { loadGameData } from './utils';
import './boardStyle.css';



export function Vocabble() {
  const { name : username, playerID, currentGameID } = useSelector(selectUser);
  const game = useSelector(selectGame);
  const board = useSelector(selectBoard);
  const tiles = useSelector(selectTiles);
  const blanks = useSelector(selectBlanks);
  const dispatch = useDispatch();



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
    <div className="Vocabble">
      <div className="User">{username}</div>
      <h1>Word at War</h1>
      <div className="GameInfo">
        <span className={(game.activePlayer === 1 ? "activePlayer" : "")+(game.player1 === playerID ? " currentPlayer" : "")}>{game.player1name} - {game.player1score}</span>
        <span className={(game.activePlayer === 2 ? "activePlayer" : "")+(game.player2 === playerID ? " currentPlayer" : "")}>{game.player2name} - {game.player2score}</span>
      </div>
      <div className="VocabbleBoard">
        <BlankTileChoice />
        {
          board.map((boardRow,r) =>
            <div key={"boardRow"+r} style={{display:"flex"}}>
              {
                boardRow.map((boardSquare,c) => {
                  const tile = tiles.find(tile => tile.location === "board" && Math.floor((tile.position-1)/15) === r && (tile.position-1)%15 === c);
                  return <BoardSpace key={`boardSquare${r}-${c}`} row={r} col={c} data={boardSquare} tile={tile} />
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
  );
}