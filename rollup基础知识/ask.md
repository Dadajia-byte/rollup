### sth
- vite 开发模式打包使用的 esbuild
- vite 生产模式打包使用的 rollup
- vite 内部也是通过插件实现的，插件的实现机制也是复用的 rollup 的插件机制(简化版)
- rollup 打包结果可以是 五种输出类型，webpack 只能是 commonjs

### rollup 常见插件
rollup 本身没有 loader 只有 插件（函数）。其中 @ 的是官方插件，其他的为社区插件
1. babel：js语法降级
2. nodeResole：解析 node_modules 第三方模块，rollup 本身不支持
3. commonjs：支持 commonjs 语法
4. typescript：支持 ts
5. terser：压缩代码
6. postcss：引入 style 标签以支持css
7. serve：本地启动服务器（开发模式）

### 五种输出模式
1. amd：已经废弃 require.js；（define）
2. es：esmodule
3. iife：立即执行函数
4. umd：(function(global,factory))()
5. cjs：commonjs 

### tree-shaking
1. 第一步
- 在 `module` 中收集 `imports`、`exports` 和 `definitions`
- 在 `analyse` 收集 `_defines` 和 `_dependsOn`
2. 第二步
- 重构 `expandAllStatements`
#### 简易解释
例如在main.js中引入msg.js
1. 找到这个语句读到或者使用的变量
2. 查找此变量name变量的定义语句，并添加到最终输出结果中
3. 判断name变量是不是外部导入的
4. 如果是，先获取外部模块的定义（msg.js）
5. 找到msg.js中定义name变量的语句，放到输出结果里

其实是用到的拿过来，没用到的没有处理