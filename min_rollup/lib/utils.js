const walk = require("./ast/walk");

function hasOwnProperty(obj,prop) {
  return Object.prototype.hasOwnProperty.call(obj,prop)
}

function replaceIdentifier(statement, source, replaceName) {
  walk(statement, {
    enter(node) {
      if (node.type === 'Identifier') {
        if (node.name && replaceName[node.name]) source.overwrite(node.start, node.end, replaceName[node.name]);
      }
    }
  })
}

exports.hasOwnProperty = hasOwnProperty;
exports.replaceIdentifier = replaceIdentifier;