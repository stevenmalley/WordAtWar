import { Tile } from './Tile';



export function BoardSpace({ data, tile, boardWidth }) {

  return (
    <div className={"boardSpace"+(data.bonus? ` ${data.bonus}` : "")+(data.centre? " board-centre" : "")+(tile? " boardSpace-faded" : "")}
      //style={{width:"calc(100%/15)",height:"calc(100%/15)"}}>
      style={{width:"var(--tileSize)",height:"var(--tileSize)"}}>
      {
        tile ? <Tile data={tile} /> : null
      }
    </div>
  );
}