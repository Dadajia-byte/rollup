const path = require('path');
const fs = require('fs');
const MagicString = require('magic-string');
const Module = require('./module');
class Bundle {
  constructor(options) {
    // 入口文件路径绝对路径生产
    this.entryPath = path.resolve(options.entry);
  }
  build(output) {
    const entryModule = this.fetchModule(this.entryPath);
    this.statements = entryModule.expandAllStatements();
    const {code} = this.generate();
    fs.writeFileSync(output, code);
  }

  generate() {
    let bundle = new MagicString.Bundle();
    this.statements.forEach(statement=>{
      const source = statement._source.clone();
      bundle.addSource({
        content: source,
        separator: '\n', // 分隔符
      });
    });
    return {code: bundle.toString()};
  }

  fetchModule(importee) {
    let route = importee;
    if (route) {
      // 读取文件内容
      const code = fs.readFileSync(route, 'utf-8');
      // 创建一个模块的实例
      const module = new Module({
        code, // 模块的源代码
        path: route, // 模块的绝对路径
        bundle: this // 当前的 bundle 实例
      });
      return module;
    }
  }
}
/**
 * rollup 中的 bundle 类似于 webpack 中的 compiler
 * 在 webpack 中一切皆 module
 */

module.exports = Bundle;