const walk = require('./walk');
const Scope = require('./scope');
/**
 * 分析对应模块的语法树
 * @param {*} ast 语法树
 * @param {*} code 源代码
 * @param {*} module 模块实例
 */
function analyse(ast, code, module) {
  // 开启了第一轮循环，判断导出导入了哪些变量
  ast.body.forEach((statement)=>{
    Object.defineProperties(statement, {
      _included: { value: false, writable: true }, // 这条语句默认不包括在输出结果里
      _module: { value: module }, // 当前模块
      _source: { value: code.snip(statement.start, statement.end) }, // 当前模块的源代码
      _dependsOn: { value: [] }, // 当前模块依赖的模块
      _defines: { value: [] }, // 当前模块定义的变量
    });
    if (statement.type === 'ImportDeclaration') { // 如果语句类型是导入声明
      let source = statement.source.value; // 获取导入的模块相对路径
      statement.specifiers.forEach((specifier) => { // 遍历导入的变量
        let importName = specifier.imported.name; // 获取导入的变量名
        let localName = specifier.local.name; // 获取本地变量名
        /**
         * 例如：import { age as a } from './msg';
         * localName = a
         * importName = age
         * source = ./msg
         */
        // 当前模块导入的变量名，localName来自于source模块导出的importName变量
        module.imports[localName]= { source, importName };
        });
      } else if (statement.type === 'ExportNamedDeclaration') { // 如果语句类型是导出声明
        const declaration = statement.declaration;
        if (declaration && declaration.type === 'VariableDeclaration') {
          const declarations = declaration.declarations;
          declarations.forEach((variableDeclarator) => { // var a = 1, b = 2, c = 3
            const localName = variableDeclarator.id.name; // 获取变量名
            const exportName = localName; // 获取导出变量名
            module.exports[exportName] = { localName }; // 当前模块导出的变量名
          });
        }
      }
  });
  // 开启第二轮循环，创建作用域链
  // 需要知道当前模块需要用到哪些变量，用到的变量留下，没用到的不管理
  // 还得确定这个变量是局部变量还是全局变量
  let currentScope = new Scope({name: '模块内的顶级作用域'}); // 创建顶级作用域
  ast.body.forEach(statement=>{
    function addToScope(name) {
      currentScope.add(name); // 把此变量名添加到当前作用域的变量数组中
      if (!currentScope.parent) { // 如果当前作用域没有父作用域, 说明是顶级作用域
        statement._defines[name] = true; // 表示当前语句定义了name这个变量顶级变量 
        module.definitions[name] = statement; // 此顶级变量的定义语句就是这个语句
      }
    }
    walk(statement, {
      enter(node) {
        if (node.type === 'Identifier') { // 如果节点类型是标识符
          statement._dependsOn[node.name] = true; // 表示当前语句依赖了node.name这个变量
        }
        let newScope;
        switch (node.type) {
          case 'FunctionDeclaration': // 函数声明
            addToScope(node.id.name); // 添加函数名到作用域
            const names = node.params.map(param => param.name); // 获取函数参数
            newScope = new Scope({
              name: node.id.name, 
              parent: currentScope, // 创建新作用域时，父作用域就是当前作用域
              names
            }); // 创建函数作用域
            break;
          case 'VariableDeclaration': // 变量声明
            const declarations = node.declarations;
            declarations.forEach(declaration => {
              const localName = declaration.id.name; // 获取变量名
              addToScope(localName); // 添加到作用域
            });
            break;
          default:
            break;
        }
        if (newScope) {
          Object.defineProperty(node, '_scope', {
            value: newScope,
            writable: true
          })
        }
      },
      leave(node) {
        // 如果该节点有_scope属性，进入时会创建一个新作用域，离开时要把当前作用域设置为父作用域
        if (Object.hasOwnProperty(node, '_scope')) {
          currentScope = currentScope.parent;
        }
      }
    })
  });

  ast.body.forEach(statement=>{
    
  })
}

module.exports = analyse;