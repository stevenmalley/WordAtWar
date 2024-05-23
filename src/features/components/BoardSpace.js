import { useSelector } from 'react-redux';
import { selectBlanks } from './blanksSlice';
import { Tile } from './Tile';



export function BoardSpace({ data, tile }) {

  const blanks = useSelector(selectBlanks);
  const blankLetter = (tile && tile.letter === null) ? blanks.find(blank => blank.id === tile.id).letter : null;

  return (
    <div className={"boardSpace"+(data.bonus? ` ${data.bonus}` : "")+(data.centre? " board-centre" : "")+(tile? " boardSpace-faded" : "")} >
      {
        tile ? <Tile data={{...tile,blankLetter}} /> : null
      }
    </div>
  );
}