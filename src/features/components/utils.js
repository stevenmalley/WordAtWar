import { loadGame, switchPlayer } from './gameSlice';
import { loadBoard } from './boardSlice';
import { loadTiles, updatePlayerTiles } from './tileSlice';

function buildBoard(width,bonuses) {
  const gameBoard = [];
  for (let row = 0; row < width; row++) {
    const boardRow = [];
    gameBoard.push(boardRow);
    for (let col = 0; col < width; col++) {
      boardRow.push({bonus:null});
    }
  }
  for (let bonusType in bonuses) {
    bonuses[bonusType].forEach(coord => gameBoard[coord[0]][coord[1]].bonus = bonusType);
  }
  gameBoard[Math.floor(gameBoard.length/2)][Math.floor(gameBoard[0].length/2)].centre = true;
  return gameBoard;
}

export function loadGameData(dispatch,gameData,includeBoard = true) {
  gameData.swapping = false; // 'swapping tiles' mode should be disabled whenever game data is loaded (after each move and on refresh)
  dispatch(loadGame(gameData.game));
  if (includeBoard) dispatch(loadBoard(buildBoard(gameData.game.width,gameData.bonuses)));
  dispatch(loadTiles(gameData.tiles.map(tile => ({
    ...tile,
    location: parseInt(tile.location) || tile.location,
    selected: false,
    locked: tile.location === "board"}))));
}

export function loadSwapData(dispatch,swapData,playerID) {
  /*
    swapData = {
      tilesRemoved: [tileID, ...],
      newPlayerTiles: [{id,letter,score,location,position}, ...]}
  */
 dispatch(switchPlayer(swapData.activePlayer));
  dispatch(updatePlayerTiles(swapData.newPlayerTiles.map(tile => ({
    ...tile,
    location: parseInt(tile.location),
    selected: false,
    locked: false})),playerID));
}