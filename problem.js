const profile = process.env.PROFILE;

const printResult = (libs, ws) => {
  ws.write(`${libs.length}\n`);
  libs.forEach(l => {
    ws.write(`${l.index} ${l.books.length}\n`);
    ws.write(`${l.books.map(b => b.index).join(" ")}\n`);
  });
  ws.end();
};

const libScore = (lib, numDays) => {
  let score = 0;
  for (let i = 0; i < lib.books.length && i < numDays * lib.freq; i++) {
    score += lib.books[i].score;
  }
  return score;
};

const problem = (lines, ws) => {
  const [params, totalBooks, ...rest] = lines;
  const [_, numLibs, numDays] = params;
  const libs = [];
  let indexLib = 0;
  for (let i = 0; i < rest.length; i += 2) {
    const [_, signup, freq] = rest[i];
    const bookIndexes = rest[i + 1];
    const books = bookIndexes
      .map(idx => ({ index: idx, score: totalBooks[idx] }))
      .sort((a, b) => b.score - a.score);
    let lib = {
      index: indexLib,
      signup,
      freq,
      bookIndexes,
      books,
    };
    lib = {
      ...lib,
      score: libScore(lib, numDays),
    };
    libs.push(lib);
    libs.sort((a, b) => b.score - a.score);
    indexLib++;
  }

  // console.log(`numLibs: ${numLibs}`);
  // console.log(`numDays: ${numDays}`);
  // console.log(`totalBooks: ${totalBooks}`);
  // console.log(`libs:`);
  // console.log(JSON.stringify(libs, null, 2));
  printResult(libs, ws);
};

module.exports = problem;
