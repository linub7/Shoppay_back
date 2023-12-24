exports.extractMinMax = (str) => {
  const numbers = str.split('_').map(Number); // Split by underscore and convert to numbers

  // Handle cases based on array length
  if (numbers.length === 1) {
    return { min: numbers[0], max: numbers[0] }; // Single number is both min and max
  } else if (numbers.length === 2) {
    // Two numbers, determine min and max
    return { min: Math.min(...numbers), max: Math.max(...numbers) };
  } else if (numbers[0] === 0) {
    // Number with leading underscore is max
    return { min: undefined, max: numbers[1] };
  } else {
    // Invalid format
    return { min: undefined, max: undefined };
  }
};
