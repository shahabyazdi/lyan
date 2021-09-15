export default function calculate(array = [], operation) {
  let result = 0;

  if (array.length === 0) return 0;

  switch (operation) {
    case "sum":
    case "total":
      result = array.reduce(
        (value, result) => (Number(value) || 0) + Number(result) || 0
      );
      break;
    case "minus":
      result = array.reduce(
        (value, result) => (Number(value) || 0) - Number(result) || 0
      );
      break;
    case "multiply":
      result = array.reduce(
        (value, result) => (Number(value) || 0) * Number(result) || 0
      );
      break;
    case "devide":
      result = array.reduce(
        (value, result) => (Number(value) || 0) / Number(result) || 0
      );
      break;
    case "average":
      result = calculate(array, "sum") / array.length;
      break;
    case "minimum":
    case "min":
      result = Math.min(...array);
      break;
    case "maximum":
    case "max":
      result = Math.max(...array);
      break;
    default:
      result = 0;
  }

  if (typeof result !== "number") result = Number(result || 0);

  return result % 1 !== 0 ? result.toFixed(3) : result || 0;
}
