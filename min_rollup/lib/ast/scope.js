class Scope {
  constructor(options={}) {
    // 作用域的名称
    this.name = options.name
    // 父作用域
    this.parent = options.parent
    // 作用域中定义的变量
    this.names = options.names || new Set()
  }
  add(name) {
    // 添加变量
    this.names.add(name)
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