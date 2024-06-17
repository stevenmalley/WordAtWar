import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Tile } from './Tile';
import { selectTiles } from '../store/tileSlice';
import { setMouseCoords, setDisplacedPlayerTile, selectMouse } from '../store/mouseSlice';
import { selectBoardRendered, setBoardRendered } from '../store/boardRenderedSlice';

export function PlayerTileOverlay() {
  
  const tiles = useSelector(selectTiles);
  const { coords, displacement } = useSelector(selectMouse);
  const boardRendered = useSelector(selectBoardRendered); // rerender when board is rendered so boardSpaces is populated in order to locate player hand tiles
  const [ dimensions, setDimensions ] = useState({width:window.innerHeight,height:window.innerWidth});
  const dispatch = useDispatch();

  useEffect(() => {
    // relocate tiles on window resizing
    window.addEventListener('resize', () => {setDimensions({width:window.innerHeight,height:window.innerWidth})});
  },[]);

  const playerTiles = tiles.filter(tile => !tile.locked);
  const selectedTile = playerTiles.find(tile => tile.selected);

  const boardSpaces = document.getElementsByClassName("boardSpace");
  const playerTileHolders = document.getElementsByClassName("playerTileHolder");

  const tileData = (boardSpaces.length > 0) ? playerTiles.map(tile => {
    if (tile.selected) return {tile,coords};
    if (tile.location === "board") {
      let boardSpaceRect = boardSpaces[tile.position-1].getBoundingClientRect();
      return {tile,coords:{x:boardSpaceRect.left, y:boardSpaceRect.top}};
    } else {
      let playerTileHolderRect = playerTileHolders[tile.position].getBoundingClientRect();
      return {tile,coords:{x:playerTileHolderRect.left, y:playerTileHolderRect.top}};
    }
  }) : [];

  function mousemoveHandler(e) {

    if (e.type === "touchmove") e = e.changedTouches[0];

    dispatch(setMouseCoords(e.clientX,e.clientY));

    if (e.clientY > document.querySelector('.PlayerTiles').getBoundingClientRect().top) {
      // place tile in Player Tiles
      let playerHandTiles = Array.from(document.querySelectorAll(".tile[data-location = 'player']")).sort((a,b) => parseInt(a.getAttribute("data-position"))-parseInt(b.getAttribute("data-position")));
      let minDistance = Infinity;
      let closestPosition = 0;
      for (let i = 0; i < playerHandTiles.length; i++) {
        let rect = playerHandTiles[i].getBoundingClientRect();
        let d = Math.abs(e.clientX-rect.left);
        if (d < minDistance) {
          minDistance = d;
          closestPosition = i;
        }
        if (i === playerHandTiles.length-1 && Math.abs(e.clientX-rect.right) < minDistance) {
          closestPosition = i+1;
        }
      }
      dispatch(setDisplacedPlayerTile(closestPosition));
    } else if (displacement !== 7) dispatch(setDisplacedPlayerTile(7));
  }

  return (
    <div className="PlayerTileOverlay"
      onMouseMove={selectedTile? mousemoveHandler : null}
      onTouchMove={selectedTile? mousemoveHandler : null}
      // onMouseMove={mousemoveHandler}
      // onTouchMove={mousemoveHandler}
      // style={{pointerEvents: selectedTile? "auto" : "none"}}
      >
      {
        // selectedTile? <Tile data={selectedTile} mouseCoords={coords} /> : null

        tileData.map(td => <Tile key={`playerTile-${td.tile.id}`} data={td.tile} coords={td.coords}
          displaced={td.tile.location !== "board" && td.tile.location !== "selected" && td.tile.position >= displacement} /> )


      }
    </div>
  );
}
