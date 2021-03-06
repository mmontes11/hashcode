const median = values => {
  if (values.length === 0) return 0;
  var half = Math.floor(values.length / 2);
  if (values.length % 2) return values[half];
  return (values[half - 1] + values[half]) / 2.0;
};

const avg = values => values.reduce((acc, it) => acc + it, 0) / values.length;

module.exports = {
  median,
  avg,
};
