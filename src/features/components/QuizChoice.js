import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from './userSlice';
import { selectGame, clearQuizResults } from './gameSlice';
import { loadGameData } from './utils';


// Whenever game.quizzes has content, the active player should see the questions displayed

export function QuizChoice() {

  const { playerID, currentGameID } = useSelector(selectUser);
  const game = useSelector(selectGame);
  const dispatch = useDispatch();

  let displayMode = "none";
  if (game["player"+game.activePlayer] === playerID && game.quizzes) {
    displayMode = "questions";
  } else if (game.quizResults) {
    displayMode = "results";
  }
  

  async function submit(e) {
    e.preventDefault();

    if (displayMode === "questions") {

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
    } else if (displayMode === "results") {
      dispatch(clearQuizResults());
    }
  }

  const displayed = displayMode === "none" ? "none" : "block";
  const quizData = game.quizzes || game.quizResults?.quizzes;

  function displayOptions(quiz,questionOption = "",correctOption = "correct",incorrectOption = "incorrect") {
    if (displayMode === "results") {
      if (game.quizResults.results[quiz].result) return correctOption;
      else return incorrectOption;
    } else return questionOption;
  }

  return (
    <div className="QuizChoice-modal" style={{display:displayed}}>
      <form onSubmit={submit} className="QuizChoice-form">
        {
          quizData? quizData.map((quiz,i) => <div key={`quiz-${i}`} className="quiz">
            <div>{quiz.word}:
              <span className={"quizReward "+displayOptions(i)}>{quiz.score} points</span>
              <span className={"quizResult "+displayOptions(i)}>{displayOptions(i).toUpperCase()}</span>
            </div>
            {
              quiz.quiz.map((option,d) => <div key={`quiz-${i}-definition-${d}`}
                className={"quizOption "+(displayMode==="results"? (
                  game.quizResults.results[i].correctIndex === d?
                    "correct" :
                      (game.quizResults.results[i].submittedIndex === d?
                        "incorrect" : "")) : "")}>
                <input type="radio" name={`quiz-${i}-radio`} id={`quiz-${i}-radio-${d}`} value={d} disabled={displayMode !== "questions"} />
                <label htmlFor={`quiz-${i}-radio-${d}`}>{option.definition} <span style={{fontWeight:"bold"}}>{displayMode === "results"?
                  game.quizResults.quizzes[i].quiz[d].word : ""}</span></label>
              </div>)
            }
          </div>) : null
        }
        <input type="submit" value={displayMode === "questions" ? "SUBMIT" : "OK"} />
      </form>
    </div>
  );
}