import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from './userSlice';
import { selectGame } from './gameSlice';
import { loadGameData } from './utils';


// Whenever game.quizzes has content, the active player should see the questions displayed

export function QuizChoice() {

  const { playerID, currentGameID } = useSelector(selectUser);
  const game = useSelector(selectGame);
  const dispatch = useDispatch();

  async function submit(e) {
    e.preventDefault();

    let validAnswers = true;
    const answers = [];
    for (let i = 0; i < game.quizzes.length; i++) {
      let answer = e.target[`quiz-${i}-radio`].value;
      if (answer === '') validAnswers = false;
      else answer = parseInt(answer);
      answers.push({word:game.quizzes[i].word, definitionIndex:answer});
    }
    
    if (validAnswers) {
      const response = await fetch('http://localhost/WordAtWar/php/submitQuiz.php',
        {method: "POST",
        headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
        body: JSON.stringify({playerID, gameID:currentGameID, answers})});
      //console.log(response.text());
      const gameData = await response.json();
      if (gameData.status?.name === "failure") alert(gameData.status.message);
      else loadGameData(dispatch,gameData,playerID,false);
    } else {
      alert("Please choose an answer for each vocabulary question");
    }
  }

  const displayed = (game.quizzes.length > 0 && game["player"+game.activePlayer] === playerID) ? "block" : "none";

  return (
    <div className="QuizChoice-modal" style={{display:displayed}}>
      <form onSubmit={submit} className="QuizChoice-form">
        {
          game.quizzes? game.quizzes.map((quiz,i) => <div key={`quiz-${i}`} className="quiz">
            <div>{quiz.word}: {quiz.score} points</div>
            {
              quiz.quiz.map((definition,d) => <div key={`quiz-${i}-definition-${d}`}>
                <input type="radio" name={`quiz-${i}-radio`} id={`quiz-${i}-radio-${d}`} value={d} />
                <label htmlFor={`quiz-${i}-radio-${d}`}>{definition}</label>
              </div>)
            }
          </div>) : null
        }
        <input type="submit" value="SUBMIT" />
      </form>
    </div>
  );
}