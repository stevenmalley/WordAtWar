import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setBoardRendered } from '../store/boardRenderedSlice';
import { Tile } from './Tile';



export function BoardSpace({ data, tile, score }) {
  const dispatch = useDispatch();

  let bonusText;
  switch (data.bonus) {
    case "tripleWord" : bonusText = <span>WORD<br /><span className="bonusSpaceMultiplier">&times;3</span></span>; break;
    case "doubleWord" : bonusText = <span>WORD<br /><span className="bonusSpaceMultiplier">&times;2</span></span>; break;
    case "tripleLetter" : bonusText = <span>LETTER<br /><span className="bonusSpaceMultiplier">&times;3</span></span>; break;
    case "doubleLetter" : bonusText = <span>LETTER<br /><span className="bonusSpaceMultiplier">&times;2</span></span>; break;
  }

  useEffect(() => {dispatch(setBoardRendered())},[]);


  return (
    <div className={"boardSpace"+(data.bonus? ` ${data.bonus}` : "")+(data.centre? " board-centre" : "")+(tile? " boardSpace-faded" : "")}>
        {
          data.bonus? <div className="bonusSpace">{bonusText}</div> : null
        }
        {
          tile ? <Tile data={tile} /> : null
        }
      <div className="placementScore" style={{display: score? "block" : "none"}}>{score}</div>
    </div>
  );
}