/**
 * rollup中的插件实际上就是一个函数，返回一个规定协议的对象，其中包含一些指定的属性和勾子函数
 * 钩子类型和执行方式：
 * 1.async - 可以返回Promise
 * 2.sync - 同步执行
 * 3.first - 多个插件实现时，返回第一个非null/undefined值
 * 4.sequential - 按插件顺序依次执行
 * 5.parallel - 并行执行
 */


function build(pluginOptions) {
  return {
    name: 'build', // 必需：插件的名称
    /**
     * 在rollup的配置阶段执行，可以修改rollup的配置
     * @param {*} options 
     * @returns 返回一个options对象，接下来rollup的此插件会使用这个对象作为配置进行处理；如果返回null，则不影响
     */
    options(inputOptions) {
      console.log('options');
      // 修改配置
      // 如果需要【读取】所有插件的配置内容的汇总，应该在buildStart中查看
      return { ...inputOptions, input: 'src/msg.js' };
    },
    buildStart(inputOptions) {
      console.log('buildStart');
    },
    async resolveId(source, importer) {
      console.log('resolveId', source, importer);
    },
    async load(id) {
      console.log('load', id);
    },
    async shouldTransformCachedModule({id, code}) {
      console.log('shouldTransformCachedModule', id, code);
    },
    async transform(code, id) {
      console.log('transform', code, id);
    },
    async moduleParsed(module) {
      console.log('moduleParsed', module);
    },
    async renderDynamicImport(specifier, importer) {
      console.log('renderDynamicImport', specifier, importer);
    },
    buildEnd() {
      console.log('buildEnd');
    },
  }
}

export default build;