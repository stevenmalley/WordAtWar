class Tile {
  constructor(letter,quantity,score) {
    this.letter = letter;
    this.quantity = quantity;
    this.score = score;
  }
}



export const scrabbleTiles = [
  new Tile(null,2,0),
  new Tile('A',9,1),
  new Tile('B',2,3),
  new Tile('C',2,3),
  new Tile('D',4,2),
  new Tile('E',12,1),
  new Tile('F',2,4),
  new Tile('G',3,2),
  new Tile('H',2,4),
  new Tile('I',9,1),
  new Tile('J',1,8),
  new Tile('K',1,5),
  new Tile('L',4,1),
  new Tile('M',2,3),
  new Tile('N',6,1),
  new Tile('O',8,1),
  new Tile('P',2,3),
  new Tile('Q',1,10),
  new Tile('R',6,1),
  new Tile('S',4,1),
  new Tile('T',6,1),
  new Tile('U',4,1),
  new Tile('V',2,4),
  new Tile('W',2,4),
  new Tile('X',1,8),
  new Tile('Y',2,4),
  new Tile('Z',1,10),
];

export const wordFeudTiles = [
  new Tile(null,2,0),
  new Tile('A',10,1),
  new Tile('B',2,4),
  new Tile('C',2,4),
  new Tile('D',5,2),
  new Tile('E',12,1),
  new Tile('F',2,4),
  new Tile('G',3,3),
  new Tile('H',3,4),
  new Tile('I',9,1),
  new Tile('J',1,10),
  new Tile('K',1,5),
  new Tile('L',4,1),
  new Tile('M',2,3),
  new Tile('N',6,1),
  new Tile('O',7,1),
  new Tile('P',2,4),
  new Tile('Q',1,10),
  new Tile('R',6,1),
  new Tile('S',5,1),
  new Tile('T',7,1),
  new Tile('U',4,2),
  new Tile('V',2,4),
  new Tile('W',2,4),
  new Tile('X',1,8),
  new Tile('Y',2,4),
  new Tile('Z',1,10),
];

export const wordsWithFriendsTiles = [
  new Tile(null,2,0),
  new Tile('A',9,1),
  new Tile('B',2,4),
  new Tile('C',2,4),
  new Tile('D',5,2),
  new Tile('E',13,1),
  new Tile('F',2,4),
  new Tile('G',3,3),
  new Tile('H',4,3),
  new Tile('I',8,1),
  new Tile('J',1,10),
  new Tile('K',1,5),
  new Tile('L',4,2),
  new Tile('M',2,4),
  new Tile('N',5,2),
  new Tile('O',8,1),
  new Tile('P',2,4),
  new Tile('Q',1,10),
  new Tile('R',6,1),
  new Tile('S',5,1),
  new Tile('T',7,1),
  new Tile('U',4,2),
  new Tile('V',2,5),
  new Tile('W',2,4),
  new Tile('X',1,8),
  new Tile('Y',2,3),
  new Tile('Z',1,10),
];