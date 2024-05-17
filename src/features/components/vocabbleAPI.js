import { scrabbleBonus, wordFeudBonus } from './boardData';

const board = [];
for (let row = 0; row < 15; row++) {
  const boardRow = [];
  board.push(boardRow);
  for (let col = 0; col < 15; col++) {
    boardRow.push({letter:null,bonus:null});
  }
}
const boardOption = wordFeudBonus;
for (let bonusType in boardOption) {
  boardOption[bonusType].forEach(coord => board[coord[0]][coord[1]].bonus = bonusType);
}
board[Math.floor(board.length/2)][Math.floor(board[0].length/2)].centre = true;



const gameData = [{
  board: board,
  gameID: 24,
  playerIDs: [1,2],
  currentPlayerID: 1,
  boardTiles: [
    {id:20, letter:'O', score:1, location:'board', position:{row:7,col:7}, selected:false, locked:true},
    {id:40, letter:'X', score:8, location:'board', position:{row:7,col:8}, selected:false, locked:true},
  ],
  playerTiles: [
    [{id:0,letter:'A',score:1,location:'player',position:0,selected:false},
    {id:1,letter:'A',score:1,location:'player',position:1,selected:false},
    {id:2,letter:'A',score:1,location:'player',position:2,selected:false},
    {id:3,letter:'A',score:1,location:'player',position:3,selected:false},
    {id:4,letter:'A',score:1,location:'player',position:4,selected:false},
    {id:5,letter:'A',score:1,location:'player',position:5,selected:false},
    {id:6,letter:'A',score:1,location:'player',position:6,selected:false}],
    [{id:7,letter:'E',score:1,location:'player',position:0,selected:false},
    {id:8,letter:'E',score:1,location:'player',position:1,selected:false},
    {id:9,letter:'E',score:1,location:'player',position:2,selected:false},
    {id:10,letter:'E',score:1,location:'player',position:3,selected:false},
    {id:11,letter:'E',score:1,location:'player',position:4,selected:false},
    {id:12,letter:'E',score:1,location:'player',position:5,selected:false},
    {id:13,letter:'N',score:1,location:'player',position:6,selected:false}]],
  playerScores: [0,0]
}];



function getGame(gameID, playerID) {
  const game = gameData.find(game => game.gameID === gameID);
  const output = {
    game: {
      mode: "feud",
      width: 15,
      player1: game.playerIDs[0],
      player2: game.playerIDs[1],
      player1Score: game.playerScores[0],
      player2Score: game.playerScores[1]
    },
    tiles: game.playerTiles[game.playerIDs.indexOf(playerID)].concat(game.boardTiles.map(tile => ({...tile, position:(tile.position.row-1)*15+tile.position.col}))),
    bonuses: wordFeudBonus
  }

  return output;
}



export function fetchGameData(gameID,playerID) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(getGame(gameID,playerID), 1000));
  });
}



export async function fetchGameDataAPI(gameID,playerID) {
  const response = await fetch(`http://localhost/vocabble/php/getGameData.php?gameID=${gameID}&playerID=${playerID}`);
  return await response.json();
}


// A mock function to mimic making an async request for data
export function fetchBoardData(gameID) {
  return new Promise((resolve) => {
    const { board } = gameData.find(game => game.gameID === gameID);
    setTimeout(() => resolve(board, 1000));
  });
}

export function fetchTileData(gameID,playerID) {
  return new Promise((resolve) => {
    const game = gameData.find(game => game.gameID === gameID);
    const tiles = game.playerTiles[game.playerIDs.indexOf(playerID)].concat(game.boardTiles);
    setTimeout(() => resolve(tiles, 1000));
  });
}

export function drawTiles(gameID,playerID) {

}