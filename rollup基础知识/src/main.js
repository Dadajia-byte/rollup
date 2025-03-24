import { name, age} from './msg.js'; // 引入 msg.js 模块
import _ from "lodash";
import $ from "jquery"
console.log(_.concat([1,2,3],4,5));
console.log($);

console.log(name); // 输出 name 变量

export default 'main';