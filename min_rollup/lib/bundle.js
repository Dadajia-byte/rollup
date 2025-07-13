const path = require('path');
const fs = require('fs');
const MagicString = require('magic-string');
const Module = require('./module');
const { hasOwnProperty, replaceIdentifier } = require('./utils');
class Bundle {
  constructor(options) {
    // 入口文件路径绝对路径生产
    this.entryPath = path.resolve(options.entry.replace(/\.js$/, '')+'.js');
    this.modules = new Set();
  }
  build(output) {
    const entryModule = this.fetchModule(this.entryPath);
    this.statements = entryModule.expandAllStatements();
    this.deconflict();
    const {code} = this.generate();
    fs.writeFileSync(output, code);
  }

  deconflict() {
    const defines = {}; // 定义的变量
    const conflicts = {}; // 冲突的变量
    this.statements.forEach(statement=>{
      Object.keys(statement._defines).forEach(name=>{
        if(hasOwnProperty(defines, name)) {
          conflicts[name] = true;
        } else {
          defines[name] = [];
        }
        // 把定义的变量对应的模块添加到数组
        defines[name].push(statement._module);
      })
    });
    // 获取冲突变量名数组
    Object.keys(conflicts).forEach(name=>{
      const modules = defines[name];
      modules.pop(); // 最后一个变量不需要重命名
      modules.forEach((module, index)=>{
        let replaceName = `${name}$$${modules.length - index}`;
        module.rename(name, replaceName);
      })
    })
  }

  generate() {
    let bundle = new MagicString.Bundle();
    this.statements.forEach(statement=>{
      let replaceName = {};
      // 获取依赖的变量名和定义的变量数组
      Object.keys(statement._dependsOn)
        .concat(Object.keys(statement._defines))
        .forEach(name=>{
          const canonicalName = statement._module.getCanonicalName(name);
          if(canonicalName !== name) {
            replaceName[name] = canonicalName;
          }
      });
      const source = statement._source.clone();
      if (statement.type === 'ExportNamedDeclaration') {
        source.remove(statement.start, statement.declaration.start);
      }
      replaceIdentifier(statement, source, replaceName);
      bundle.addSource({
        content: source,
        separator: '\n', // 分隔符
      });
    });
    return {code: bundle.toString()};
  }

  /**
   * 
   * @param {*} importee 被引入的模块
   * @param {*} importer 引入模块的模块
   * @returns 
   */
  fetchModule(importee, importer) {
    let route;
    if (!importee) {
      route = importee
    } else {
      if (path.isAbsolute(importee)) {
        route = importee.replace(/\.js$/, '')+'.js';
      } else {
        route = path.resolve(path.dirname(importer), importee.replace(/\.js$/, '')+'.js');
      }
    }
    if (route) {
      // 读取文件内容
      const code = fs.readFileSync(route, 'utf-8');
      // 创建一个模块的实例
      const module = new Module({
        code, // 模块的源代码
        path: route, // 模块的绝对路径
        bundle: this // 当前的 bundle 实例
      });
      this.modules.add(module); // 把模块实例添加到集合中
      return module;
    }
  }
}
/**
 * rollup 中的 bundle 类似于 webpack 中的 compiler
 * 在 webpack 中一切皆 module
 */

module.exports = Bundle;