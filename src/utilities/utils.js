import { loadGame, switchPlayer } from '../features/store/gameSlice';
import { loadBoard } from '../features/store/boardSlice';
import { loadTiles, updatePlayerTiles } from '../features/store/tileSlice';

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

export function loadGameData(dispatch,gameData,playerID,includeBoard = true) {
  console.log(gameData);
  
  gameData.game.quizzes = gameData.quizzes || null;
  gameData.game.quizResults = gameData.quizResults || null;
  
  gameData.game.swapping = false; // 'swapping tiles' mode should be disabled whenever game data is loaded (after each move and on refresh)

  // lock tiles on the board BEFORE applying locations saved in localStorage (which might be on the board but unlocked)
  gameData.tiles.forEach(tile => {
    tile.locked = tile.location === "board";
  });

  // if any client-side positions are found for player tiles, apply them, otherwise assign positions in order
  const clientTilePositions = JSON.parse(localStorage.getItem(`WordAtWar-game${gameData.game.id}-player${playerID}-clientTilePositions`));
  if (clientTilePositions) {
    clientTilePositions.forEach(tp => {
      const tile = gameData.tiles.find(tile => tile.id === tp.id);
      // the opponent might have submitted tiles where the player had temporarily placed them; remove the player's tile from the board if it is blocked
      const blockingTile = tp.location === "board" ? gameData.tiles.find(tile => tile.location === "board" && tile.position === tp.position) : null;
      if (tile && !blockingTile) {
        tile.location = tp.location;
        tile.position = tp.position;
        tile.blankLetter = tp.blankLetter;
      }
    });
  }

  // for clientTiles in the PlayerTile display (not on the board), collapse those with unique numerical positions down so they increment from 0, and give continuing numbers to any others
  let positionedTiles = gameData.tiles.filter(tile => tile.location !== "board" && !isNaN(tile.position)).sort((a,b) => a.position-b.position);
  positionedTiles.forEach((tp,i) => tp.position = i);
  gameData.tiles.filter(tp => tp.location !== "board" && !positionedTiles.includes(tp)).forEach((tp,i) => tp.position = i+positionedTiles.length);
  
  dispatch(loadGame(gameData.game));
  if (includeBoard) dispatch(loadBoard(buildBoard(gameData.game.width,gameData.bonuses)));
  dispatch(loadTiles(gameData.tiles.map(tile => ({
    ...tile,
    location: parseInt(tile.location) || tile.location,
    selected: false}))));
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