import babel from '@rollup/plugin-babel'; // babel 插件
import nodeResolve from "@rollup/plugin-node-resolve"; 
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser'; // 带@的是官方插件，没有的是社区插件，实际上terser也有官方了，这里为了做区分用的还是老的
import postcss from 'rollup-plugin-postcss';
import serve from 'rollup-plugin-serve';
export default {
  input: 'src/main.ts',
  output: {
    file: 'dist/bundle.js', // 输出的文件路径和文件名
    format: 'cjs', // 输出的格式，这里是 CommonJS 格式；五种输出模式 amd/es/iife/umd/cjs
    name: 'bundleName', // 输出的全局变量名称;当 format 为 iife/umd 时需要指定（得有一个默认导出不然调用不了）
    globals: { // 指定外部依赖的全局变量名
      lodash: '_',
      jquery: '$',
    }
  },
  external:['lodash','jquery'], // 外部依赖（cdn或者其他项目内部引入过）
  plugins: [
    babel({
      exclude: /node_modules/, // 排除 node_modules 目录
      babelHelpers: 'bundled', // 显式配置 babelHelpers
    }),
    nodeResolve(), // 解析 node_modules 中的模块, rollup 本身不支持三方库
    commonjs(), // 支持commonjs语法
    typescript(), // 支持ts
    terser(), // 压缩代码
    postcss(),
    serve({
      open: true,
      port: 8080,
      contentBase: './dist'
    })
  ]
}