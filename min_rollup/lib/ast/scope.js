class Scope {
  constructor(options={}) {
    // 作用域的名称
    this.name = options.name;
    // 父作用域
    this.parent = options.parent;
    // 作用域中定义的变量
    this.names = options.names || [];
    // 表示这个作用域是否为块级作用域
    this.isBlock = !!options.isBlock;
  }
  add(name, isBlockDeclaration) {
    // 如果此变量不是块级变量 var，并且当前作用域是块级作用域
    if (!isBlockDeclaration && this.isBlock) {
      console.log(this.parent, '添加变量', name, 123);
      
      this.parent.add(name, isBlockDeclaration) // 添加到父作用域(变量提升)
    } else {
      // 添加变量
      this.names.push(name)
    }
  }
  findDefiningScope(name) {
    if(this.names.includes(name)) {
      return this
    } else if(this.parent) {
      return this.parent.findDefiningScope(name)
    } else {
      return null
    }
  }
}

module.exports = Scope