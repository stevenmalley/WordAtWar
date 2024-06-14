CREATE TABLE users (
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
  player1score INTEGER NOT NULL DEFAULT 0,
  player2score INTEGER NOT NULL DEFAULT 0,
  activePlayer INTEGER DEFAULT 1, -- 1 or 2, referencing player1 or player2, or 0 when game is complete
  player1passed boolean DEFAULT FALSE, -- record if the previous move was a pass, (if both players' previous moves were passes, another pass will end the game)
  player2passed boolean DEFAULT FALSE,
  quizzes TEXT DEFAULT '', -- stringified JSON of the quiz for the most-recently submitted words, stored while the player has not yet submitted an answer
  history TEXT DEFAULT '', -- stringified JSON of an array containing the sequence of submissions and their results
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
  position INTEGER, -- order in bag, on board ((row-1)*width+col, giving values 1 to width*width), or in player supply
  gameID INTEGER REFERENCES game(id),
  PRIMARY KEY (id, gameID)
);