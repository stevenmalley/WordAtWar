import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from './userSlice';
import { selectGame, clearQuizResults } from './gameSlice';
import { loadGameData } from './utils';
import serverPath from '../../serverPath';


// Whenever game.quizzes has content, the active player should see the questions displayed
// Whenever game.quizResults has content, the active player should see questions with answers displayed

export function QuizChoice() {

  const { playerID, currentGameID } = useSelector(selectUser);
  const game = useSelector(selectGame);
  const dispatch = useDispatch();
  const [ selectedOptions, setSelectedOptions ] = useState(game.quizzes? Array(game.quizzes.length).fill(-1) : []);

  let displayMode = "none";
  if (game["player"+game.activePlayer] === playerID && game.quizzes) {
    displayMode = "questions";
  } else if (game.quizResults) {
    displayMode = "results";
  }

  // reset selectedOptions when game changes so that previous selections are not preserved and applied to a quiz
  useEffect(() => setSelectedOptions(game.quizzes? Array(game.quizzes.length).fill(-1) : []),[game]);

  async function submit(e) {
    e.preventDefault();

    if (displayMode === "questions") {

      let validAnswers = true;
      const answers = [];
      for (let i = 0; i < selectedOptions.length; i++) {
        if (selectedOptions[i] > -1) answers.push({word:game.quizzes[i].word, definitionIndex:selectedOptions[i]});
        else validAnswers = false;
      }
      
      if (validAnswers) {
        const response = await fetch(serverPath+'/php/submitQuiz.php',
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
    <div className="QuizChoice-modal WordAtWar-modal" style={{display:displayed}}>
      <form onSubmit={submit} className="QuizChoice-form WordAtWar-modalWindow">
        <div className="quizInstruction">{
            displayMode === "questions" ?
              "Choose the right definition to win points for your words" : "" }
        </div>
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
                <button
                  className={(displayMode === "questions" && selectedOptions[i] === d)? "selectedOption" : ""} disabled={displayMode !== "questions"}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedOptions(selectedOptions.map((option,optionI) => optionI === i ? d : option));}}>
                  {option.definition}&nbsp;
                  <span style={{fontWeight:"bold"}}>{displayMode === "results"?
                    game.quizResults.quizzes[i].quiz[d].word : ""}</span>
                </button>
              </div>)
            }
          </div>) : null
        }
        <div className="formFooter">
          <input type="submit" value={displayMode === "questions" ? "SUBMIT" : "CLOSE"} />
        </div>
      </form>
    </div>
  );
}