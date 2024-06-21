export function PlayerTiles() {
  
  return (
    <div className="PlayerTiles">
      {
        Array(7).fill(null).map((_,t) => <div key={`playerTileHolder-${t}`} className="playerTileHolder"></div> )
      }
    </div>
  );
}