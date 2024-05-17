CREATE TABLE user (
  id SERIAL PRIMARY KEY,
  name TEXT,
  password TEXT
);

CREATE TABLE game (
  id SERIAL PRIMARY KEY,
  mode TEXT, -- (bonuses pattern): scrabble, feud, friends, custom
  width INTEGER DEFAULT 15,
  player1 INTEGER REFERENCES user(id),
  player2 INTEGER REFERENCES user(id),
  player1score INTEGER NOT NULL DEFAULT '0',
  player2score INTEGER NOT NULL DEFAULT '0',
  activePlayer INTEGER DEFAULT 1, -- 1 or 2, referencing player1 or player2
  complete boolean DEFAULT FALSE -- game over
);

-- used only for 'custom' mode
CREATE TABLE bonus (
  gameID INTEGER REFERENCES game(id),
  id INTEGER,
  type TEXT, -- DW, TW, DL, TL
  position INTEGER, -- row*width + col
  PRIMARY KEY (id, gameID)
);

CREATE TABLE tile (
  id INTEGER,
  letter char(1),
  score INTEGER,
  location TEXT, -- "board", "bag", or playerID of player who has it in their supply
  position INTEGER, -- order in bag, on board (row*width + col), or in player supply
  gameID INTEGER REFERENCES game(id),
  PRIMARY KEY (id, gameID)
);