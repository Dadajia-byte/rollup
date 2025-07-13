const MagicString = require('magic-string');
const { parse } = require('acorn');
const analyse = require('./ast/analyse');
const { hasOwnProperty } = require('./utils');
const SYSTEM_VARS = ['console', 'log']; // 系统变量
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
    // 分析语法树【module实例化时，静态分析module，分析出当前模块的依赖关系】
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
      // 默认情况下不包括所有的变量声明语句
      if (statement.type === 'VariableDeclaration') return;
      let statements = this.expandStatement(statement);
      allStatement.push(...statements);
    })
    return allStatement;
  }
  /**
   * 展开语句
   * 一定是先处理依赖的变量，再处理定义的变量
   * 例如：
   * let x = y + 1;  // 当前语句：依赖变量y，定义变量x
   * x = x * 2;      // 当前语句：依赖变量x，修改变量x
   * 处理x时，一定得先知道y，所以y的定义语句一定得先处理
   * 处理x时，一定得先知道x，所以x的修改语句一定得后处理
   */
  expandStatement(statement) {
    statement._included = true; // 是否包含
    let result = [];
    // 找到此语句使用的所有变量，并把这些变量的定义语句取出来，放到result数组中
    const _dependsOn = Object.keys(statement._dependsOn); // 1. 一定是先处理依赖的变量
    _dependsOn.forEach(name=>{ // 2. 随后处理依赖变量的定义语句
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
      if (statement) {
        if (statement._included) { // 如果此语句已经包含在结果里了，说明是重复的
          // 直接返回空数组
          return [];
        } else { // 如果此语句没有包含在结果里
          // 说明是第一次使用这个变量,展开
          return this.expandStatement(statement);
        }
      } else { // 如果没有找到这个变量的定义语句
        if (SYSTEM_VARS.includes(name)) { // 如果是系统变量，直接返回空数组
          return [];
        } else { // 如果不是系统变量，说明是一个错误
          throw new Error(`找不到变量${name}的定义语句(没有从外部导入，也没有内部声明)`);
        }
      }
    }
  }
}

module.exports = Module;