const { avg, median } = require("./util");

const factors = {
  normSignUp: 1,
  normFreq: 1,
  normAvg: 1,
  normMedian: 1,
  normLength: 1,
};

const printResult = (libs, ws) => {
  ws.write(`${libs.length}\n`);
  libs.forEach(l => {
    ws.write(`${l.index} ${l.books.length}\n`);
    ws.write(`${l.books.map(b => b.index).join(" ")}\n`);
  });
  ws.end();
};

const libScore = lib => {
  const values = lib.books.map(it => it.score);
  return {
    avg: avg(values),
    median: median(values),
  };
};

const heuristicValue = l => {
  return (
    factors.normSignUp * l.normSignUp +
    factors.normFreq * l.normFreq +
    factors.normAvg * l.normAvg +
    factors.normMedian * l.normMedian +
    factors.normLength * l.normLength
  );
};

const max  = (list, key) =>{
  let maxVal = 0;
  for(let i=0; i<list.length; i++){
    if(list[i][key] > maxVal ){
      maxVal = list[i][key];
    }
  }
  return maxVal;
};

const totalScore = (libs, numDays) => {
  let score = 0;
  let repeated = [];
  let initDay =0;
  libs.forEach(function(lib){
        initDay += lib.signup;
        for(let i=0;i<lib.books.length && i<lib.freq*(numDays - initDay);i++){
          let book = lib.books[i];
          if(repeated.indexOf(book.index) == -1){
             score += book.score;
             repeated.push(book.index);
          }    
        }
  })
  console.log(score);
  return score;
};

const optimize = (libs, numDays, totalBooks) => {
  const result = [];
  console.log("1")
  let currentDays = numDays;

  const maxSignUp = Math.max(...libs.map(l => l.signup));
  console.log("2")

  const maxFreq = Math.max(...libs.map(l => l.freq));
  const maxBookVal = 1;//Math.max(...totalBooks);
  const maxBookLength = Math.max(...libs.map(l => l.books.length));
  console.log("3")

  while (libs.length > 0 && currentDays > 0) {
    console.log(libs.length)
    for (let i = 0; i < libs.length; i++) {
      libs[i].books.slice(0, libs[i].freq * currentDays)
      libs[i].normSignUp = libs[i].signup / maxSignUp,
      libs[i].normFreq = libs[i].freq / maxFreq;
      libs[i].normAvg = libs[i].score.avg / maxBookVal;
      libs[i].normMedian = libs[i].score.median / maxBookVal;
      libs[i].normLength = libs[i].books.length / maxBookLength;
      libs[i].heuristic = heuristicValue(libs[i]); 
    }
    libs = libs.sort((a, b) => a.heuristic - b.heuristic);
    const [first, ...rest] = libs;
    libs = rest;
    currentDays -= first.signup;
    result.push(first);
  }
  return result;
};

const problem = (lines, ws) => {
  const [params, totalBooks, ...rest] = lines;
  const [_, numLibs, numDays] = params;
  let libs = [];
  let indexLib = 0;
  for (let i = 0; i < rest.length; i += 2) {
    const [_, signup, freq] = rest[i];
    const bookIndexes = rest[i + 1];
    const books = bookIndexes
      .map(idx => ({ index: idx, score: totalBooks[idx] }))
      .filter(it => it.score !== 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.min(bookIndexes.length, numDays * freq));
    let lib = {
      index: indexLib,
      signup,
      freq,
      bookIndexes,
      books,
    };
    lib = {
      ...lib,
      score: libScore(lib),
    };
    libs.push(lib);
    libs.sort((a, b) => b.score - a.score);
    indexLib++;
  }
  libs = optimize(libs, numDays, totalBooks);
  // console.log(`numLibs: ${numLibs}`);
  // console.log(`numDays: ${numDays}`);
  // console.log(`totalBooks: ${totalBooks}`);
  // console.log(`libs:`);
  console.log(JSON.stringify(libs, null, 2));

  printResult(libs, ws);

  totalScore(libs, numDays)
};

module.exports = problem;
