import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, setUser } from './userSlice';
import { selectGame, setSwapping } from './gameSlice';
import { selectTiles, returnAllTiles, cancelSwaps } from './tileSlice';
import { loadGameData, loadSwapData } from './utils';


export function GameControls() {

  const user = useSelector(selectUser); // TESTING, used for newGame()
  const { playerID, currentGameID } = useSelector(selectUser);
  const game = useSelector(selectGame);
  const tiles = useSelector(selectTiles);
  const placedTiles = tiles.filter(tile => tile.location === "board" && !tile.locked);
  const placedBlanks = placedTiles.filter(tile => !tile.letter);
  const swappedTiles = tiles.filter(tile => tile.swapping);
  const dispatch = useDispatch();

  
  async function submit() {

    // swapping tiles
    if (game.swapping && swappedTiles.length > 0 && game.bag > 0) {
      toggleSwap();
      const response = await fetch('http://localhost/WordAtWar/php/submitSwap.php',
        {method: "POST",
        headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
        body: JSON.stringify({playerID, gameID:currentGameID,
          tiles:swappedTiles.map(tile => tile.id)})});
      const swapData = await response.json();
      if (swapData.status?.name === "failure") alert(swapData.status.message);
      else loadSwapData(dispatch,swapData,playerID);

    // submitting played tiles
    } else if (placedTiles.length > 0) {
      const response = await fetch('http://localhost/WordAtWar/php/submitPlay.php',
        {method: "POST",
        headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
        body: JSON.stringify({playerID, gameID:currentGameID,
          tiles:placedTiles.map(tile => [tile.id,tile.position]),
          blanks:placedBlanks.map(blank => [blank.id,blank.blankLetter])})});
      //console.log(response.text());
      const gameData = await response.json();
      console.log(gameData);
      if (gameData.status?.name === "failure") alert(gameData.status.message);
      else loadGameData(dispatch,gameData,playerID,false);
    }
  }

  async function pass() {
    const response = await fetch('http://localhost/WordAtWar/php/submitPass.php',
        {method: "POST",
        headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
        body: JSON.stringify({playerID, gameID:currentGameID})});
      const gameData = await response.json();
      if (gameData.status?.name === "failure") alert(gameData.status.message);
      else loadGameData(dispatch,gameData,playerID,false);
  }

  async function newGame() {
    await fetch(`http://localhost/WordAtWar/php/deleteGame.php?gameID=${currentGameID}`);
    dispatch(setUser({...user, currentGameID: currentGameID+1}));

    await fetch(`http://localhost/WordAtWar/php/setupGame.php?player1ID=13&player2ID=17&gameMode=feud`);

    const response = await fetch(`http://localhost/WordAtWar/php/getGameData.php?gameID=${currentGameID+1}&playerID=${playerID}`);
    const gameData = await response.json();
    loadGameData(dispatch,gameData,playerID);
  }
  
  async function newShortGame() {
    await fetch(`http://localhost/WordAtWar/php/deleteGame.php?gameID=${currentGameID}`);
    dispatch(setUser({...user, currentGameID: currentGameID+1}));

    await fetch(`http://localhost/WordAtWar/php/setupGame.php?player1ID=13&player2ID=17&gameMode=feud`);

    await fetch(`http://localhost/WordAtWar/php/deleteBagTilesTESTING.php?gameID=${currentGameID+1}`);

    const response = await fetch(`http://localhost/WordAtWar/php/getGameData.php?gameID=${currentGameID+1}&playerID=${playerID}`);
    const gameData = await response.json();
    loadGameData(dispatch,gameData,playerID);

  }

  

  function switchUser() {
    let newPlayerID, newUsername;
    if (user.playerID === game.player1) {
      newPlayerID = game.player2;
      newUsername = game.player2name;
    } else {
      newPlayerID = game.player1;
      newUsername = game.player1name;
    }
    dispatch(setUser({...user, playerID:newPlayerID, name:newUsername}));
  }

  function toggleSwap() {
    dispatch(setSwapping(!game.swapping));
    dispatch(cancelSwaps());
  }

  return (
    <div className="GameControls">
      <button onClick={pass}>PASS</button>
      <button onClick={toggleSwap} disabled={game.bag===0}>{game.swapping? "CANCEL SWAP" : "SWAP TILES"}</button>
      <button onClick={() => dispatch(returnAllTiles(playerID))}>RETURN</button>
      <button onClick={submit}>SUBMIT</button>
      <br />
      <br />
      <button onClick={switchUser}>SWITCH USER</button>
      <br />
      <br />
      <button onClick={newGame}>DELETE AND CREATE NEW GAME</button>
      <button onClick={newShortGame}>SHORT GAME</button>
    </div>
  );
}