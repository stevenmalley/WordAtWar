import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, setUser } from './userSlice';
import { selectGame } from './gameSlice';
import { selectTiles } from './tileSlice';
import { selectBlanks } from './blanksSlice';
import { loadGameData } from './utils';


export function GameControls() {

  const user = useSelector(selectUser); // TESTING, used for newGame()
  const { playerID, currentGameID } = useSelector(selectUser);
  const game = useSelector(selectGame);
  const tiles = useSelector(selectTiles);
  const blanks = useSelector(selectBlanks);
  const placedTiles = tiles.filter(tile => tile.location === "board" && !tile.locked);
  const placedBlanks = blanks.filter(blank => placedTiles.map(tile => tile.id).includes(blank.id));
  const dispatch = useDispatch();

  
  async function submit() {
    if (placedTiles.length > 0) {

      const response = await fetch('http://localhost/vocabble/php/submitPlay.php',
        {method: "POST",
        headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
        body: JSON.stringify({playerID, gameID:currentGameID,
          tiles:placedTiles.map(tile => [tile.id,tile.position]),
          blanks:placedBlanks.map(blank => [blank.id,blank.letter])})});
      //console.log(response.text());
      const gameData = await response.json();

      console.log(gameData.score);

      if (gameData.status?.name === "failure") alert(gameData.status.message);
      else loadGameData(dispatch,gameData,false);
    }
  }

  async function newGame() {
    await fetch(`http://localhost/vocabble/php/deleteGame.php?gameID=${currentGameID}`);
    dispatch(setUser({...user, currentGameID: currentGameID+1}));

    await fetch(`http://localhost/vocabble/php/setupGame.php?player1ID=1&player2ID=2&gameMode=feud`);

    const response = await fetch(`http://localhost/vocabble/php/getGameData.php?gameID=${currentGameID+1}&playerID=${playerID}`);
    const gameData = await response.json();
    loadGameData(dispatch,gameData);
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

  return (
    <div className="GameControls">
      <button onClick={submit}>SAVE</button>
      <button onClick={switchUser}>SWITCH USER</button>
      <br />
      <br />
      <button onClick={newGame}>DELETE AND CREATE NEW GAME</button>
    </div>
  );
}