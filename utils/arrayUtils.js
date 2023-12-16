exports.filterArray = (array, property) =>
  array.filter((el) => el?.name === property).map((item) => item?.value);

exports.removeDuplicates = (array) => [...new Set(array)];

exports.randomize = (array) => [...array].sort(() => 0.5 - Math.random());
