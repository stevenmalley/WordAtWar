// const words = [];
// async function fetchWords() {
//   const response = await fetch("./utils/getWords.php");
//   if (response.ok) {
//     try {
//       const json = await response.json();
//       words = json.words.filter(word => word.length < 9 || Math.random() < 0.1);
//     } catch (error) {
//       console.log(response);
//     }
//   }
// }




// let results = [];
// let errors = [];
// async function timeFunctionRandom(r,t) {
  
//   if (r === 0) {
//     console.log(results);
//     console.log("errors:",errors);
//     console.log(Date.now()-t);
//     return;
//   }

//   const testWords = words;
//   const randomWord = testWords[Math.floor(Math.random()*testWords.length)];
  
//   const check = await checkWord(randomWord);
//   results.push(check.message);
//   if (check.result === "false") errors.push("false negative: "+check.message);
  
//   const checkError = await checkWord(randomWord+"xyz");
//   results.push(checkError.message);
//   if (checkError.result === "true") errors.push("false positive: "+checkError.message);

//   return await timeFunctionRandom(r-1,t);
// }
//fetchWords().then(()=>timeFunctionRandom(100,Date.now()));




async function fetchQuiz() {
  const response = await fetch("../php/getDefinitionsAPI.php",
    {method: "POST",
    headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
    body: JSON.stringify({"words":["foot","paradigm","hateful","desiderata","metaphrast"]})});
  if (response.ok) {
    try {
      const json = await response.json();
      console.log(json);
    } catch (error) {
      console.log(error);
      console.log(response);
    }
  }
}


let results = [];
let errors = [];
async function timeFunctionRandom(r,t) {
  
  if (r === 0) {
    console.log(Date.now()-t);
    return;
  }
  const check = await fetchQuiz();

  return await timeFunctionRandom(r-1,t);
}

function go() {
  timeFunctionRandom(10,Date.now());
}