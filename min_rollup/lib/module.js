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
    });
    // 存放本模块中导入了哪些变量
    this.imports = {};
    // 存放本模块中导出了哪些变量
    this.exports = {};
    // 存放本模块的顶级变量的定义语句是哪条(不包含外部导入的顶级变量)
    this.definitions = {};
    // 分析语法树
    analyse(this.ast, this.code, this);
    // console.log('imports', this.imports);
    // console.log('exports', this.exports);
    console.log('definitions', this.definitions);

    
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