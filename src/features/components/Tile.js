import { selectUser } from './userSlice';
import { selectTile, placeTile, returnTile } from './tileSlice';
import { placeBlank } from './blanksSlice';
import { selectMouse, setMouseCoords } from './mouseSlice';
import { useSelector, useDispatch } from 'react-redux';

export function Tile({ data }) {

  const { playerID } = useSelector(selectUser);
  const dispatch = useDispatch();
  const { letter, score, id, selected, locked, blankLetter } = data;
  const { coords : mouseCoords } = useSelector(selectMouse);

  function handleMouseDown(event) {
    const { pageY : y, pageX : x } = event;
    dispatch(setMouseCoords(x,y));
    dispatch(selectTile(id));
    event.stopPropagation();
  }

  function handleMouseUp(e) {
    let boardSpaces = document.querySelectorAll(".boardSpace");
    let minDistance = Infinity;
    let closestPosition = 0;
    let maxY = 0;
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
        if (rect.bottom > maxY) maxY = rect.bottom;
      }
    }
    let playerTilesY = document.querySelector('.VocabblePlayerTiles').getBoundingClientRect().top;

    if (Math.abs(e.clientY-playerTilesY) < Math.abs(e.clientY-maxY)) {
      // place tile in Player Tiles
      let playerTiles = document.querySelectorAll(".VocabblePlayerTiles .tile");
      let minDistance = Infinity;
      let closestPosition = 0;
      let rightEdge = 0;
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

      dispatch(returnTile(playerID,id,closestPosition-1));

    } else {
      // place tile on board
      if (letter !== null) {
        dispatch(placeTile(id,closestPosition));
      } else {
        dispatch(placeBlank(id,closestPosition));
      }
    }
  }

  function positionStyles() {
    if (selected) {
      return {
        position:"absolute",
        top:(mouseCoords.y-16)+"px",
        left:(mouseCoords.x-16)+"px",
        zIndex: 200,
        //pointerEvents: "none", // allow a BoardSpace beneath the dragged element to detect mouse events
      };
    } else return {};
  }

  return (
    <div
      className={"tile"+(selected? " selected" : "")+(locked? " locked" : "")}
      onMouseDown={locked? null : handleMouseDown}
      onMouseUp={selected? handleMouseUp : null}
      style={positionStyles()}>
      <div className="tile-letter">{letter || blankLetter}</div>
      <div className="tile-score">{score || ""}</div>
    </div>
  );
}