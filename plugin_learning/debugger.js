import { rollup } from 'rollup';
import rollupOptions from './rollup.config.js';
/**
 * rollup的执行分为三个阶段
 * 1. 打包阶段
 * 2. 生成阶段
 * 3. 写入阶段
 */
(async function() {
  // 1. 打包阶段 build阶段，插件都是在此阶段执行的
  const bundle = await rollup(rollupOptions);
  // 2. 生成阶段
  await bundle.generate(rollupOptions.output);
  // 3. 写入阶段
  await bundle.write(rollupOptions.output);
  // 4. 关闭阶段
  await bundle.close();
})();