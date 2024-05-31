import { selectUser } from './userSlice';
import { selectGame } from './gameSlice';
import { selectTile, placeTile, returnTile, clearBlankChoice, toggleSwap } from './tileSlice';
import { setMouseCoords, setDisplacedPlayerTile } from './mouseSlice';
import { useSelector, useDispatch } from 'react-redux';

export function Tile({ data, displaced = false, mouseCoords = null }) {

  const { playerID } = useSelector(selectUser);
  const { swapping:swapMode } = useSelector(selectGame);
  const dispatch = useDispatch();
  const { letter, score, id, selected, locked, blankLetter, location, position, swapping } = data;

  function handleMouseDown(e) {
    if (swapMode) {
      dispatch(toggleSwap(id));
    } else {
      dispatch(setMouseCoords(e.clientX,e.clientY));
      if (location !== "board") dispatch(setDisplacedPlayerTile(position));
      dispatch(selectTile(id));
      if (blankLetter) dispatch(clearBlankChoice(id));
      e.stopPropagation();
    }
  }

  function handleMouseUp(e) {
    let minDistance = Infinity;
    let closestPosition = 0;

    if (e.clientY > document.querySelector('.VocabblePlayerTiles').getBoundingClientRect().top) {
      // place tile in Player Tiles
      let playerTiles = document.querySelectorAll(".VocabblePlayerTiles .tile");
      let minDistance = Infinity;
      let closestPosition = 0;
      for (let i = 0; i < playerTiles.length; i++) {
        let rect = playerTiles[i].getBoundingClientRect();
        let d = Math.abs(e.clientX-rect.left);
        if (d < minDistance) {
          minDistance = d;
          closestPosition = i;
        }
        if (i === playerTiles.length-1 && Math.abs(e.clientX-rect.right) < minDistance) {
          closestPosition = i+1;
        }
      }
      dispatch(setDisplacedPlayerTile(7));
      dispatch(returnTile(playerID,id,closestPosition-1));

    } else {
      // place tile on board

      let boardSpaces = document.querySelectorAll(".boardSpace");
      for (let i = 0; i < boardSpaces.length; i++) {
        if (!boardSpaces[i].querySelector(".tile")) {
          let rect = boardSpaces[i].getBoundingClientRect();
          let dx = e.clientX-(rect.right+rect.left)/2;
          let dy = e.clientY-(rect.top+rect.bottom)/2;
          let d = Math.sqrt((dx*dx)+(dy*dy));
          if (d < minDistance) {
              minDistance = d;
              closestPosition = i+1;
          }
        }
      }
      dispatch(placeTile(id,closestPosition));
    }
  }

  function tileStyles() {
    if (selected) {
      return {
        position:"absolute",
        top:(mouseCoords.y-16)+"px",
        left:(mouseCoords.x-16)+"px",
        zIndex: 200,
      };
    } else return {};
  }

  return (
    <div
      className={"tile"+(selected? " selected" : "")+(locked? " locked" : "")+(displaced? " displaced" : "")+(swapping && location !== "board" ? " swapping" : "")}
      onMouseDown={locked? null : handleMouseDown}
      onMouseUp={selected? handleMouseUp : null}
      style={tileStyles()}>
      <div className="tile-letter">{letter || blankLetter}</div>
      <div className="tile-score">{score || ""}</div>
    </div>
  );
}