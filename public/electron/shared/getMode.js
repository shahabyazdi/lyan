module.exports = function (mode) {
  if (["edit", "template"].includes(mode)) return "Template";

  return "File";
};
