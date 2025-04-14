const MagicString = require('magic-string');
const { parse } = require('acorn');
const analyse = require('./ast/analyse');
const { hasOwnProperty } = require('./utils');
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
    // 存放变量修改语句
    this.modifications = {};
    // 分析语法树
    analyse(this.ast, this.code, this);
    // console.log('imports', this.imports);
    // console.log('exports', this.exports);
    // console.log('definitions', this.definitions);
  }
  /**
   * 展开所有语句
   */
  expandAllStatements() {
    let allStatement = [];
    this.ast.body.forEach(statement => {
      if (statement.type === 'ImportDeclaration') return;
      let statements = this.expandStatement(statement);
      allStatement.push(...statements);
    })
    return allStatement;
  }
  /**
   * 展开语句
   */
  expandStatement(statement) {
    statement._included = true; // 是否包含
    let result = [];
    // 找到此语句使用的所有变量，并把这些变量的定义语句取出来，放到result数组中
    const _dependsOn = Object.keys(statement._dependsOn);
    _dependsOn.forEach(name=>{
      // 找到此变量的定义语句，添加到结果里
      let definitions = this.define(name);
      result.push(...definitions);
    })
    result.push(statement);
    // 找到此语句定义的变量，把此变量对应的修改语句也包括进来
    const defines = Object.keys(statement._defines);
    defines.forEach(name=>{
      // 找到此变量的修改语句
      const modifications = hasOwnProperty(this.modifications, name) && this.modifications[name];
      if (modifications) {
        modifications.forEach(modification=>{
          if(!modification._included) {
            let statement = this.expandStatement(modification);
            result.push(...statement);
          }
        })
      }
    })
    return result;
  }

  /**
   * 找到对应变量的定义语句
   * @param {*} name 定义的变量别名
   * @returns 
   */
  define(name) {
    // 需要区分变量是内部声明的还是外部导入的
    if (hasOwnProperty(this.imports, name)) { // 外部导入的
      // 获取是从哪个模块导入的哪个变量
      const { source, importName } = this.imports[name];
      // 获取导入的模块，source相对于当前模块的相对路径，path是当前模块的绝对路径
      const importedModule = this.bundle.fetchModule(source, this.path);
      const { localName }  = importedModule.exports[importName];
      return importedModule.define(localName); // 递归处理
    } else {
      // 如果非导入模块，是本地模块的话，获取此变量的变量定义语句
      let statement = this.definitions[name];
      if (statement && !statement._included) {
        return this.expandStatement(statement)
      } else {
        return [];
      }
    }
  }
}

module.exports = Module;