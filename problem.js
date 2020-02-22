const { avg, median } = require("./util");

const factors = {
  normSignUp: -200,
  normFreq: 2,
  normAvg: 2,
  normMedian: 2,
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

const allEqual = arr => arr.every( v => v === arr[0] );

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
 });
  console.log("Score: "+ score);
  return score;
};

const optimize = (libs, numDays, totalBooks) => {
  const result = [];
  let currentDays = numDays;
  
  let maxSignUp = Math.max(...libs.map(l => l.signup));
  let maxFreq = Math.max(...libs.map(l => l.freq));

  let idxAux =0;
  let t = new Date().getTime();
  const allBookEquals = allEqual(totalBooks);
  while (libs.length > 0 && currentDays > 0) {
    const maxBookLength = Math.max(...libs.map(l => l.books.length));
    const maxBookVal = allBookEquals ? totalBooks[0] : Math.max(...totalBooks);
    if(idxAux % 100 ==0){
      console.log(libs.length);
      let t2 = new Date().getTime();
      console.log("t: " + (t2-t));
      t = t2;
    }

    for (let i = 0; i < libs.length; i++) {
      libs[i].books.slice(0, libs[i].freq * currentDays);
      libs[i].normSignUp = libs[i].signup / maxSignUp,
      libs[i].normFreq = libs[i].freq / maxFreq;
      libs[i].normAvg = libs[i].avg / maxBookVal;
      libs[i].normMedian = libs[i].median / maxBookVal;
      libs[i].normLength = libs[i].books.length / maxBookLength;
      libs[i].heuristic = heuristicValue(libs[i]); 
    }
    libs = libs.sort((a, b) => b.heuristic - a.heuristic);
    const [first, ...rest] = libs;
    libs = rest;
    currentDays -= first.signup;
    if (first.signup === maxSignUp){
      maxSignUp = Math.max(...libs.map(l => l.signup));
    }
    if (first.freq === maxFreq){
      maxFreq = Math.max(...libs.map(l => l.freq));
    }
    result.push(first);
    for (let i =0; i < first.books.length; i++){
      var bookIndex = first.books[i].index;
      totalBooks.splice(bookIndex, 1);
      for(let j =0; j< libs.length; j++){
        var oldLength = libs[j].books.length;
        libs[j].books = libs[j].books.filter(b => b.index != bookIndex);
        if(!allBookEquals && oldLength !== libs[j].books.length){
          libs[j].avg = avg(libs[j].books);
          libs[j].median = median(libs[j].books);
        }
      }
    }
    libs = libs.filter(l => l.books.length !== 0);
    idxAux++;
  }
  return result;
};

const problem = (lines, ws) => {
  let t1 = new Date().getTime();
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
      books
    };
    const values = books.map(it => it.score);
    lib.avg = avg(values);
    lib.median = median(values);
    libs.push(lib);
    indexLib++;
  }
  libs = optimize(libs, numDays, totalBooks);
  // console.log(`numLibs: ${numLibs}`);
  // console.log(`numDays: ${numDays}`);
  // console.log(`totalBooks: ${totalBooks}`);
  // console.log(`libs:`);
 // console.log(JSON.stringify(libs, null, 2));

  printResult(libs, ws);

  totalScore(libs, numDays)
  let t2 = new Date().getTime();
  console.log("total time " + (t2-t1));
};

module.exports = problem;
