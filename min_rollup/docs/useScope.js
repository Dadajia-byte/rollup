const Scope = require('./3.scope')

var a =1;
function one() {
  var b = 2;
  function two() {
    var c = 3;
    console.log(a, b, c);
  }
}
let globalScope = new Scope({
  name: 'global',
  parent: null,
  names: ['a']
})
let oneScope = new Scope({
  name: 'one',
  parent: globalScope,
  names: ['b']
})
let twoScope = new Scope({
  name: 'two',
  parent: oneScope,
  names: ['c']
})

console.log(
  twoScope.findDefiningScope('a').name,
  twoScope.findDefiningScope('b').name,
  twoScope.findDefiningScope('c').name,
);
