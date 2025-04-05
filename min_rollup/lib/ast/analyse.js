/**
 * 分析对应模块的语法树
 * @param {*} ast 语法树
 * @param {*} code 源代码
 * @param {*} module 模块实例
 */
function analyse(ast, code, module) {
  ast.body.forEach((statement)=>{
    Object.defineProperties(statement, {
      _included: { value: false, writable: true }, // 这条语句默认不包括在输出结果里
      _module: { value: module }, // 当前模块
      _source: { value: code.snip(statement.start, statement.end) }, // 当前模块的源代码
    })
  })
}

module.exports = analyse;