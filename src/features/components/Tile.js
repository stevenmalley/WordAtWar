import { selectUser } from '../store/userSlice';
import { selectGame } from '../store/gameSlice';
import { selectTile, placeTile, returnTile, clearBlankChoice, toggleSwap } from '../store/tileSlice';
import { setMouseCoords, setDisplacedPlayerTile } from '../store/mouseSlice';
import { useSelector, useDispatch } from 'react-redux';

export function Tile({ data, displaced = false, coords = null }) {

  const { playerID } = useSelector(selectUser);
  const { swapping:swapMode } = useSelector(selectGame);
  const dispatch = useDispatch();
  const { letter, score, id, selected, locked, blankLetter, location, position, swapping } = data;


  function handleMouseDown(e) {
    
    let clientX, clientY;
    if (e.type === "touchstart") {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    if (swapMode) {
      dispatch(toggleSwap(id));
    } else {
      dispatch(setMouseCoords(clientX,clientY));
      if (location !== "board") dispatch(setDisplacedPlayerTile(position));
      dispatch(selectTile(id));
      if (blankLetter) dispatch(clearBlankChoice(id));
      e.stopPropagation();
    }
  }

  function handleMouseUp(e) {

    let clientX, clientY;
    if (e.type === "touchend") {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    let minDistance = Infinity;
    let closestPosition = 0;

    if (clientY > document.querySelector('.PlayerTiles').getBoundingClientRect().top) {
      // place tile in Player Tiles
      let playerHandTiles = Array.from(document.querySelectorAll(".tile[data-location = 'player']")).sort((a,b) => parseInt(a.getAttribute("data-position"))-parseInt(b.getAttribute("data-position")));
      let minDistance = Infinity;
      let closestPosition = 0;
      for (let i = 0; i < playerHandTiles.length; i++) {
        let rect = playerHandTiles[i].getBoundingClientRect();
        let d = Math.abs(clientX-rect.left);
        if (d < minDistance) {
          minDistance = d;
          closestPosition = i;
        }
        if (i === playerHandTiles.length-1 && Math.abs(clientX-rect.right) < minDistance) {
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
          let dx = clientX-(rect.right+rect.left)/2;
          let dy = clientY-(rect.top+rect.bottom)/2;
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
    if (coords) {
      let top = (coords.y+1)+"px";
      let left = (coords.x+1)+"px";
      if (selected) {
        top = `calc(${top} - 0.5*var(--tileSize))`;
        left = `calc(${left} - 0.5*var(--tileSize))`;
      } else if (displaced) {
        left = `calc(${left} + var(--tileSize))`;
      }
      return {
        position:"absolute",
        top,left
      };
    } else return {};
  }

  return (
    <div
      className={"tile"+(selected? " selected" : "")+(locked? " locked" : "")+(displaced? " displaced" : "")+((swapping && !locked) ? " swapping" : "")}
      onMouseDown={locked? null : handleMouseDown}
      onTouchStart={locked? null : handleMouseDown}
      onMouseUp={selected? handleMouseUp : null}
      onTouchEnd={selected? handleMouseUp : null}
      style={tileStyles()}
      data-location={typeof(location) === "string" ? location : "player"}
      data-position={position}
      >
      <div className="tile-letter">{letter || blankLetter}</div>
      <div className="tile-score">{score || ""}</div>
    </div>
  );
}