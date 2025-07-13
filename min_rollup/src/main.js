import { name, age as a } from './msg';
import { age1 } from './age1';
import { age2 } from './age2';
import { age3 } from './age3';

console.log(age1, age2, age3);

if (true) {
  var k = '变量提升';
}
console.log(k);