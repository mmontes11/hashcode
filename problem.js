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

const optimize = (libs, numDays, totalBooks) => {
  const result = [];
  let currentDays = numDays;
  const maxSignUp = Math.max(...libs.map(l => l.signup));
  const maxFreq = Math.max(...libs.map(l => l.freq));
  const maxBookVal = Math.max(...totalBooks);
  const maxBookLength = Math.max(...libs.map(l => l.books.length));
  while (libs.length > 0 && currentDays > 0) {
    libs = libs.map(l => ({
      ...l,
      books: l.books.slice(0, l.freq * currentDays),
    }));
    libs = libs.map(l => {
      const newLib = {
        ...l,
        normSignUp: l.signup / maxSignUp,
        normFreq: l.freq / maxFreq,
        normAvg: l.score.avg / maxBookVal,
        normMedian: l.score.median / maxBookVal,
        normLength: l.books.length / maxBookLength,
      };
      const heuristic = heuristicValue(newLib);
      return {
        ...newLib,
        books: l.books.slice(0, l.freq * currentDays),
        heuristic,
      };
    });
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
};

module.exports = problem;
