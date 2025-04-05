const Bundle = require('./bundle'); 
/**
 * 
 * @param {*} entry 入口文件
 * @param {*} output 输出目录加文件夹
 */
function rollup(entry,output) {
  const bundle = new Bundle({entry});
  bundle.build(output)
}

module.exports = rollup;