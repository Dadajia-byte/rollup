const MagicString = require('magic-string');
const { parse } = require('acorn');
const analyse = require('./ast/analyse');
class Module {
  constructor({code,path,bundle}) {
    this.code = new MagicString(code); // 源代码
    this.path = path; // 模块的绝对路径
    this.bundle = bundle; // 当前的 bundle 实例
    // 获取语法树
    this.ast = parse(code, {
      ecmaVersion: 8,
      sourceType: 'module',
    })
    // 分析语法树
    analyse(this.ast, this.code, this)
  }
  /**
   * 展开所有语句
   */
  expandAllStatements() {
    let allStatement = [];
    this.ast.body.forEach(statement => {
      let statements = this.expandAllStatement(statement);
      allStatement.push(...statements);
    })
    return allStatement;
  }
  /**
   * 展开语句
   */
  expandAllStatement(statement) {
    statement._included = true; // 是否包含
    let result = [];
    result.push(statement);
    return result;
  }
}

module.exports = Module;