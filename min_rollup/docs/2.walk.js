const acorn = require('acorn');
const sourceCode = `import $ from 'jquery';`
const ast = acorn.parse(sourceCode, { // 解析选项
  locations: true, // 是否生成位置信息
  ranges: true, // 是否生成范围信息
  sourceType: 'module', // 模块类型
  ecmaVersion: 8, // ECMAScript 版本
})

// 遍历语法树
ast.body.forEach((statement)=>{
  walk(statement, {
    enter(node) {
      console.log('进入',node.type);
    },
    leave(node) {
      console.log('离开',node.type);
    }
  })
})

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
}