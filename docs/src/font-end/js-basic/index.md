# JavaScript 基础
## 数据类型
## js基础
### new的原理
#### 面向对象中new关键字
new操作实质上是定一个具有构造函数内置对象的的实例。
具体分为以下四个步骤
1. 新建一个空对象（obj）
2. 将obj的__proto__属性链接到构造函数的原型上
3. 使用fn.apply改变函数执行的上下文，也就是将函数此时this指向为obj
4. 返回该对象

::: code-group

```javascript{2} [第1步]
function myNew(fn, ...args) {
    const obj = {}
    obj.__proto__ = fn.prototype
    const res = fn.apply(obj, args);
    return typeof res === 'obj' ? res : obj;
}
```

```javascript{3} [第2步]
function myNew(fn, ...args) {
    const obj = {}
    obj.__proto__ = fn.prototype
    const res = fn.apply(obj, args);
    return typeof res === 'obj' ? res : obj;
}
```

```javascript{4} [第3步]
function myNew(fn, ...args) {
    const obj = {}
    obj.__proto__ = fn.prototype
    const res = fn.apply(obj, args);
    return typeof res === 'obj' ? res : obj;
}
```

```javascript{5} [第4步]
function myNew(fn, ...args) {
    const obj = {}
    obj.__proto__ = fn.prototype
    const res = fn.apply(obj, args);
    return typeof res === 'obj' ? res : obj;
}
```
:::

对比js new的实现过程
```javascript
// 执行构造函数
function Person(name){
    console.log('constructor')
    //3.修改this指向
    this.name = name;
}

// 2.将新建对象的__proto__设置为构造函数的prototype
Person.prototype.say = function (){
    console.log('我是',this.name)
}

// 1.创建新对象
const p = new Person('张三')
p.say()
```

### setTimeout() 与 setInterval()
#### SetTimeout() 
消息队列是用来存储「宏任务」的，并且主线程会按照顺序从队列取出队列里的任务依次执行。因此为了保证setTimeout能够在固定时间之后延迟执行，setTimeout创建的任务就不能加入消息队列，而是加入一个名为**延迟消息队列**的队列中，加入的同时它会记录创建的时间，延迟执行时间。

> [!NOTE] 宏任务
> 宏任务（Macro Task）是指在JavaScript执行过程中，需要进入主线程执行的任务。

[外链:setTimeout原理+实现](https://github.com/sisterAn/JavaScript-Algorithms/issues/98)

```javascript
setTimeout(function showName() { console.log('showName') }, 1000)
setTimeout(function showName() { console.log('showName1') }, 1000) 
console.log('hello')
```

基本执行过程：
1. 从消息队列中取出宏任务并执行（首次立即执行
2. 执行`setTimeout()`,此时创建一个延迟任务，并加入到延迟消息队列中
3. 执行`console.log('hello')`代码
4. 从延迟队列中筛选所有已经过期的任务，然后依次执行
> [!TIP]
> setTimeout会受到消息队列中宏任务的影响，延迟消息队列会在当前消息队列弹出的任务执行完之后再执行，所以当前任务的执行会阻塞延迟任务的执行；
> 也就是说如果当前消息队列弹出的任务需要很长时间执行完，那么延迟任务会被阻塞，即是已经到了它应该执行的时间

比如以下代码：
```javascript
  function showName() {
    setTimeout(function show() {
      console.log('show')
    }, 0)
    for (let i = 0; i <= 5000; i++) {}
  }
  showName()
```
延迟任务`show()`会被`showName()`后续的循环所阻塞，尽管`show()`的延迟时间是0，但由于后续循环的存在，`show()`仍然不会立即执行。

其他特点：
1. setTimeout嵌套会有4ms延迟（chrome超过5层就会把第6层的延迟修改为至少4ms
2. 未激活的tab延迟时间更改为至少1000ms
3. 延迟时间有最大值：目前主流浏览器使用32bit存储延迟时间，因此最大值为$2^{31}-1$ms,超过这个大小会立即执行。
   
#### setInterval()

setInterval的执行间隔指的是**何时将任务加入到消息队列**，而不是何时执行。因此真正的执行时间取决于何时从消息队列取出，并执行，而不是所谓的间隔时间。

如果setInterval本身的任务需要很长时间执行，长到已经超过了间隔时间，此时可能会出现多个任务同时执行的情况，当然这是很极端的情况。

考虑如下情况，可能出现setInterval的某次任务被跳过的情况：
![image.png](https://gitee.com/raining976/markdown-imgs/raw/master/img/788a403e21284339b4bf7fff34c1a392~tplv-k3u1fbpfcp-zoom-in-crop-mark:1304:0:0:0.awebp)

以上setInterval每隔100ms将T任务加入到消息队列，从创建定时器开始，第一个100ms将T1加入到消息队列，此时主线程仍有任务执行，因此需要等待，而且T的执行时间要超过100ms，因此等到下一个100ms时，T2加入到了消息队列，但是此时T1仍在执行，因此需要等待，加入T的执行时间很长，长到等到第三个100ms，定时器此时按照约定应该要将T3任务加入到消息队列，但是此时由于消息队列中仍有上次加入的T2还没有执行，因此选择**跳过本次任务的加入**。这也就导致setInterval在某些情况下会跳过某次任务。

结合上述，我们可以总结setInterval的两个缺点

1. 使用setInterval时，某些任务会被跳过（上述T3情况）
2. 多个定时器可能会连续执行（上述的T1T2就是连续执行了）

总结一下，setTimeout做的是将任务加入到延迟队列中，过了约定好的时间会主线程将其取出来执行，但是如果取出来的时候主线程还在执行其他任务，此时就可能会延迟一会；而setInterval则是每隔一段时间将任务加入到消息队列，如果此时消息队列中仍有上次加入的任务且没有被执行，则跳过本次任务的加入，如果此时有其他任务在被主线程执行，则需要延迟执行。

可以看出来，setInterval所带来的缺点是实际生产中所无法接受的，因为这两个缺点会导致其代码含义发生变化，所以，实际生产中一般会使用setTimeout模拟setInterval来规避掉其缺点。

### Object方法

object常用方法总结

#### Object.assign(target, source1, source2,...)

该方法主要用于对象的合并，将源对象**自身**的所有可枚举属性浅拷贝到目标对象，不拷贝继承属性。

注意几点：

1. 如果源对象的属性为引用数据类型，那么就会拷贝引用。
2. 同名属性会进行替换
3. 只进行值的复制，如果源对象某个属性是一个取值函数，那么取值后再复制
4. 可以用来处理数组，但是会把数组当成对象处理（可以认为数组元素索引就是键）

```javascript
// Object.assign(target, source)
const target = {a:1, b: 2, c: 3}
const source = {c:4, d: 9, get sum(){return this.c + this.d},obj:{ name: '张三'}}

Object.assign(target, source)
target.obj.name = '李四'
console.log('target',target)
// target { a: 1, b: 2, c: 4, d: 9, sum: 13, obj: { name: '李四' } } // 同名覆盖，取值函数计算完再复制
console.log('source',source)
// source { c: 4, d: 9, sum: [Getter], obj: { name: '李四' } } // 引用类型拷贝的是引用
console.log(Object.assign([1,2,3],[4,5]))
// [ 4, 5, 3 ] // 数组会当成对象看待
```

#### Obect.create(prototype, [propertiesObject])

使用指定的原型对象和新的属性创建对象，第二个参数为创建的对象的自身属性

```javascript
var parent = {
    x: 1,
    y: 2
}
var child = Object.create(parent, {
    z:{
        writable:true,
        configurable:true,
        enumerable: true, // 如果不加这个是否可枚举 无法通过打印child打印出该属性
        value: "newAdd"
    }
})

console.log('child',child) // child { z: 'newAdd' }
console.log('child.x',child.x) // child.x 1
```

> [!NOTE]
>
> 这里使用属性对象添加时，是否可枚举默认是false，如果不指定为true， 直接打印child不会打印z属性

#### Object.values()

#### Object.keys()

```javascript
const arr = ['a', 'b', 'c']
Object.keys(arr) // ['0','1','2']
```

#### Object.entries(obj)

返回一个对象中可枚举属性的键值对数组，与for in返回的顺序一致，区别在于**for in可以枚举原型中的属性**

```javascript
const obj = { foo: 'bar', baz: 42 };
console.log(Object.entries(obj)); // [ ['foo', 'bar'], ['baz', 42] ]

const simuArray = { 0: 'a', 1: 'b', 2: 'c' };
console.log(Object.entries(simuArray)); // [ ['0', 'a'], ['1', 'b'], ['2', 'c'] ]
```

#### Object.fromEntries(obj)

把键值对数组转为一个对象，相当于上一个函数的逆过程

#### Object.prototype.hasOwnProperty(key)

判断对象自身属性中是否含有key属性:`obj.hasOwnProperty(keyname)`

该函数是Object原型上的函数，可以判断一个属性是否是该对象的自身属性。

> [!TIP]
> `hasOwnProperty(keyname)`是javascript唯一一个<u>处理属性但是不访问原型链</u>的函数



#### Object.getOwnPropertyNames(obj)

返回一个指定对象的所有属性名的数组，包括不可枚举属性，但是不包括Symbol值作为名称的属性

相比于Object.keys只能返回可枚举属性。

> [!NOTE]
>
> Object.keys和Object.getOwnPropertyNames返回的键是按照<u>字典顺序排列的，而不是初始顺序</u>

```javascript
const obj2 = {
    '1': 2,
    'a': 5,
    'e': 'hello',
    'b': 'world',
    '3': 3,
    '2': 10,
}

console.log('Object.keys(obj2)',Object.keys(obj2))
// Object.keys(obj2) [ '1', '2', '3', 'a', 'e', 'b' ]

console.log('Object.getOwnPropertyNames(obj)',Object.getOwnPropertyNames(obj2))
// Object.getOwnPropertyNames(obj) [ '1', '2', '3', 'a', 'e', 'b' ]
```

#### Object.setPrototype(obj, prototype)

设置一个对象的原型

等同于`obj.__proto__` = prototype

#### Object.getPrototype(obj)

获取一个对象的原型

等同于`obj.__proto__`

> [!tip]
>
> 上述两个方法，如果obj传入的不是对象，会自动转为对象

#### Object.is(a,b)

判断两个值是否相等

```javascript
Object.is('foo', 'foo');     // true
Object.is(window, window);   // true

Object.is('foo', 'bar');     // false
Object.is([], []);           // false

var test = { a: 1 };
Object.is(test, test);       // true

Object.is(null, null);       // true

// 特例
Object.is(0, -0);            // false
Object.is(-0, -0);           // true
Object.is(NaN, 0/0);         // true
```

#### Object.freeze(obj)

返回一个冻结对象，不能向这个对象添加属性、删除已有的属性，不能修改该对象的可枚举性、可配执性、可写性

也就是说冻结以后该对象就不能被修改了

#### Object.isFreezen(obj)

判断一个对象是否被冻结

#### Object.preventExtensions(obj)

返回的对象不能添加新的属性，可以修改和删除
