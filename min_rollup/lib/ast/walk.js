function walk(astNode, {enter,leave}) {
  visit(astNode, null, enter, leave);
}

// 深度优先递归遍历语法树
function visit(node, parent, enter, leave) {
  if(enter) {
    enter(node, parent);
  }
  const keys = Object.keys(node).filter(key=>typeof node[key] === 'object');
  keys.forEach(key => {
    let value = node[key];
    if(Array.isArray(value)) {
      value.forEach(val=>{
        if (val.type) {
          visit(val, node, enter, leave)
        }
      });
    } else if(value && value.type) {
      visit(value, node, enter, leave);
    }
  })
  if(leave) {
    leave(node, parent);
  }
};
module.exports = walk;