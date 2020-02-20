"use strict";

const readLine = require("readline");
const fs = require("fs");
const dataSet = process.argv.length >= 3 ? process.argv[2] : undefined;
const profile = process.env.PROFILE;
const intervalIds = [];
const problem = require("./problem");

const main = dataSet => {
  const [filename] = dataSet.split(".");
  const lines = [];

  const lineReader = readLine.createInterface({
    input: fs.createReadStream(`${__dirname}/in/${dataSet}`),
  });
  const ws = fs.createWriteStream(`${__dirname}/out/${filename}.out`);

  lineReader.on("line", line => {
    let numbers = line.split(" ").map(str => parseInt(str, 10));
    const isNan = numbers.some(x => Number.isNaN(x));
    if (!isNan) {
      lines.push(numbers);
    }
  });
  lineReader.on("close", () => {
    if (profile) {
      const intervalId = setInterval(() => {
        problem(lines, ws);
      }, 1000);
      intervalIds.push(intervalId);
    } else {
      problem(lines, ws);
    }
  });
};

if (dataSet) {
  main(dataSet);
} else {
  fs.readdirSync(`${__dirname}/in`)
    .filter(file => file.endsWith(".txt"))
    .forEach(file => {
      main(file);
    });
}

process.on("SIGINT", () => {
  if (intervalIds.length > 0) {
    intervalIds.forEach(i => clearInterval(i));
  }
});
