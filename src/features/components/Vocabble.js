import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from './userSlice';
import { getBoard, loadBoard, selectBoard } from './boardSlice';
import { selectTiles, loadTiles } from './tileSlice';
import { BoardSpace } from './BoardSpace';
import { PlayerTiles } from './PlayerTiles';
import { GameControls } from './GameControls';
import { fetchGameDataAPI } from './vocabbleAPI';
import './boardStyle.css';



export function Vocabble() {
  const { playerID, currentGameID } = useSelector(selectUser);
  const board = useSelector(selectBoard);
  const tiles = useSelector(selectTiles);
  const dispatch = useDispatch();

  //useEffect(()=>{dispatch(getBoard())},[]);

  function buildBoard(width,bonuses) {
    const gameBoard = [];
    for (let row = 0; row < width; row++) {
      const boardRow = [];
      gameBoard.push(boardRow);
      for (let col = 0; col < width; col++) {
        boardRow.push({letter:null,bonus:null});
      }
    }
    for (let bonusType in bonuses) {
      bonuses[bonusType].forEach(coord => gameBoard[coord[0]][coord[1]].bonus = bonusType);
    }
    gameBoard[Math.floor(gameBoard.length/2)][Math.floor(gameBoard[0].length/2)].centre = true;
    return gameBoard;
  }

  
  useEffect(() => {
    async function fetcher() {
      console.log("FETCHING");
      const gameData = await fetchGameDataAPI(currentGameID,playerID);
      dispatch(loadBoard(buildBoard(gameData.game.width,gameData.bonuses)));
      dispatch(loadTiles(gameData.tiles.map(tile => ({...tile, location: parseInt(tile.location) || tile.location, selected: false, locked: tile.location === "board"}))));
    }
    fetcher();
  },[]);


  return (
    <div className="Vocabble">
      <h1>Word at War</h1>
      <div className="VocabbleBoard">
        {
          board.map((boardRow,r) =>
            <div key={"boardRow"+r} style={{display:"flex"}}>
              {
                boardRow.map((boardSquare,c) => {
                  const tile = tiles.find(tile => tile.location === "board" && Math.ceil(tile.position/15) === r && tile.position%15 === c);
                  return <BoardSpace key={`boardSquare${r}-${c}`} row={r} col={c} data={boardSquare} tile={tile} />
                })
              }
            </div>
          )
        }
      </div>
      <PlayerTiles />
      <GameControls />
    </div>
  );
}