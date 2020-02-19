const profile = process.env.PROFILE;

const problem = (lines, ws) => {
  const [params, data] = lines;
  if (!profile) {
    ws.write(`${params.length}\n`);
    ws.write(`${params.join(" ")}\n`);
    ws.write(`${data.length}\n`);
    ws.write(`${data.join(" ")}\n`);
    ws.end();
  }
};

module.exports = problem;
