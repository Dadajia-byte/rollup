function hasOwnProperty(obj,prop) {
  return Object.prototype.hasOwnProperty.call(obj,prop)
}
exports.hasOwnProperty = hasOwnProperty;