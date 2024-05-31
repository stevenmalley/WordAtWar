export function calculateScore(board,tiles) {

  tiles = tiles.filter(tile => tile.location === "board");

  // populate tiles with row and col properties for easier checking
  tiles = tiles.map(tile => ({...tile, row: Math.floor((tile.position-1)/board.length), col: (tile.position-1)%board.length}))

  const lockedTiles = tiles.filter(tile => tile.locked);
  const playerTiles = tiles.filter(tile => !tile.locked);

  // all tiles are in a single line
  let horizontal = true;
  let coordinate, minCoord, maxCoord;
  let rowsUsed = [], colsUsed = [];

  playerTiles.forEach(tile => {
    if (!rowsUsed.includes(tile.row)) rowsUsed.push(tile.row);
    if (!colsUsed.includes(tile.col)) colsUsed.push(tile.col);
  });

  if (rowsUsed.length > 1 && colsUsed.length > 1) {
    return {error: "Tiles must be placed in a single row or column"};
  }

  if (rowsUsed.length === 1) {
    // tiles have been placed horizontally (or only a single tile has been placed)
    coordinate = rowsUsed[0];
    minCoord = Math.min(...colsUsed);
    maxCoord = Math.max(...colsUsed);
  } else {
    // tiles have been placed vertically
    horizontal = false;
    coordinate = colsUsed[0];
    minCoord = Math.min(...rowsUsed);
    maxCoord = Math.max(...rowsUsed);
  }

  // check that tiles have no gaps not filled by previously-placed tiles
  for (let c = minCoord; c <= maxCoord; c++) {
    let tileFound = false;
    tiles.forEach(tile => {
      if ((horizontal && tile.col === c && tile.row === coordinate) || (!horizontal && tile.row === c && tile.col === coordinate)) {
        tileFound = true;
      }
    });
    if (!tileFound) {
      return {error: "Placed tiles may not leave a gap between them"};
    }
  }

  // if it's the first move (no tiles on the board already), more than one tile must be placed, and one submitted tile must cover the centre
  if (lockedTiles.length === 0) {
    if (playerTiles.length < 2) return {error: "Words must be at least two letters long"};
    let centreCovered = false;
    playerTiles.forEach(tile => {
      if (tile.row === Math.floor(board.length/2) && tile.col === Math.floor(board.length/2)) centreCovered = true;
    });
    if (!centreCovered) return {error: "A tile must cover the centre square"};

  } else {
    // if it's not the first move, at least one submitted tile must touch a previous tile
    let neighbour = false;
    playerTiles.forEach(playerTile => {
      lockedTiles.forEach(lockedTile => {
        if ((lockedTile.col === playerTile.col &&
              (lockedTile.row === playerTile.row-1 || lockedTile.row === playerTile.row+1)) ||
            (lockedTile.row === playerTile.row &&
              (lockedTile.col === playerTile.col-1 || lockedTile.col === playerTile.col+1))) {
          neighbour = true;
        }
      });
    });
    if (!neighbour) {
      return {error: "Tiles must be placed touching tiles already on the board"};}
  }



  // identify words
  let submittedWords = [];
  const dimension = horizontal? 'col' : 'row'; // move along 'col' coordinate to find a horizontal word
  const perpendicular = horizontal? 'row' : 'col'; // move along 'row' coordinate to find words perpendicular to a horizontal word

  function findTile(coord) {
    return tiles.find(tile => tile.row === coord.row && tile.col === coord.col);
  }

  function searchTiles(pointedTile,direction) {

    let pointer1 = {row: pointedTile.row, col: pointedTile.col};
    let pointer2 = {row: pointedTile.row, col: pointedTile.col};
   // let word = pointedTile.letter ?? pointedTile.blankLetter;
    let wordTiles = [pointedTile];

    pointer1[direction]--;
    while (pointedTile = findTile(pointer1)) {
  //    word = (pointedTile.letter ?? pointedTile.blankLetter) + word;
      wordTiles.push(pointedTile);
      pointer1[direction]--;
    }

    pointer2[direction]++;
    while (pointedTile = findTile(pointer2)) {
  //    word += pointedTile.letter ?? pointedTile.blankLetter;
      wordTiles.push(pointedTile);
      pointer2[direction]++;
    }

    //if (word.length > 1) return {word, tiles:wordTiles}; // SOMETIMES THROWS ERRORS WITH BLANKS
    if (wordTiles.length > 1) return {tiles:wordTiles};
    else return false;
  }
  
  // find the word on the primary axis
  const dimensionSearch = searchTiles(playerTiles[0],dimension);
  if (dimensionSearch) submittedWords.push(dimensionSearch);

  playerTiles.forEach(tile => {
    let perpendicularSearch = searchTiles(tile,perpendicular);
    if (perpendicularSearch) submittedWords.push(perpendicularSearch);
  });



  // when one tile has been placed and two words created (there can only be either one or two), the primary word (first in $submittedWords) should be the longest
  if (playerTiles.length === 1 && submittedWords.length === 2) {
    if (submittedWords[1].tiles.length > submittedWords[0].tiles.length) {
      submittedWords = [submittedWords[1],submittedWords[0]];
    }
  }



  // OPTION
  // check for valid words





// /* CALCULATE SCORE */


  let totalScore = 0;
  
  submittedWords.forEach(word => {
    let wordMultiplier = 1;
    let wordScore = 0;

    word.tiles.forEach(tile => {
      let letterMultiplier = 1;
      if (!tile.locked) {
        switch (board[tile.row][tile.col].bonus) {
          case "doubleLetter" : letterMultiplier = 2; break;
          case "tripleLetter" : letterMultiplier = 3; break;
          case "doubleWord" : wordMultiplier *= 2; break;
          case "tripleWord" : wordMultiplier *= 3; break;
          default: break;
        }
      }
      wordScore += tile.score*letterMultiplier;
    });
    wordScore *= wordMultiplier;
    totalScore += wordScore;
  });


  // bingo
  if (playerTiles.length === 7) {
    totalScore += 40;
  }


  return {
    score: totalScore,
    coord: {
      row: Math.max(...rowsUsed),
      col: Math.max(...colsUsed)
    }
  };
}