# CSS基础

## 基本原理

### 选择器的优先级

| 选择器         | 格式          | 优先级权重 |
| :------------- | ------------- | ---------- |
| id             | #id           | 100        |
| 类             | .classname    | 10         |
| 属性           | a[ref='eee']  | 10         |
| 伪类选择器     | li:last-child | 10         |
| 标签           | div           | 1          |
| 伪元素选择器   | li::after     | 1          |
| 相邻兄弟选择器 | h1+p          | 0          |
| 子选择器       | div > p       | 0          |
| 后代选择器     | li a          | 0          |
| 通配符选择器   | *             | 0          |

其他绑定样式的方法：

- 内联样式：1000
- !important：最高
- 继承得到的样式优先级最低

### 盒子模型

#### 基本介绍

- 标准盒子模型：content、padding、border、margin

  - `box-sizing: content-box;`
  - 盒子真正的大小是由content、padding、border三者构成

- IE盒模型：content（padding+border）、margin

  - `box-sizing: border-box;`
  - 盒子的宽高只有content决定，padding和border被算进宽高之中，也就是说只要写定了宽高，那么padding和border只会向内扩展，盒子大小就是宽高，这一点区别于标准盒模型

  #### padding

  控制子元素在父元素里面的位置关系。

  使用padding属性的几种方法：

  - 四周：`padding: 10px;`
  - 上下、左右：`padding: 10px 20px;`
  - 上、左右、下：`padding: 10px 20px 30px;`
  - 上、右、下、左：`padding: 10px 20px 30px 40px;`

  #### margin

  控制元素与元素之间的距离。

  单独使用margin属性与padding的对应方向是一样的。

  > [!IMPORTANT]
  >
  > margin通常出现的两个bug：
  >
  > 1. **margin塌陷**：两个相邻元素上下的margin值不会叠加，而是会按照<u>较大</u>的值设置。
  >
  > 2. 如果父元素和第一个子元素没有浮动的情况下，给第一个子元素添加`margin-top`，会错误的放在父元素上边。
  >
  >    这里浏览器渲染出来的并不是我们想的那样：子元素相对于父元素的top多了一个间距，而是直接作用于了父盒子上，让父盒子顶部被顶开了，即使此时父元素没有margintop属性。

#### margin塌陷是如何产生的

首先这并不是一个bug，css设计者本身就知道有这样的一个“bug”，margin塌陷主要是为了兼容在css1.0之前的p标签，因为p标签默认样式是上下带有相同的margin，如果没有margin塌陷，那么最开始的p和最后一个p的margin就比中间元素之间的margin小（小1em），这不符合设计师的想法，也不符合原来p标签的默认样式，因此为了解决这个问题，就把这种情况规定为一种特殊情况，于是就诞生了margin collapse的官方规定。

```css
p {
  display: block;
  margin-top: 1em;
  margin-bottom: 1em;
  margin-left: 0;
  margin-right: 0;
}
```

margin collapse：

- 大前提：元素之间没有被非空内容、padding、border或者clear分开
- 带有以下情况的任意一种都会引发margin塌陷
  - 一个元素的margin-top和它第一个子元素的margin-top
  - 普通流一个元素的margin-bottom和它紧邻兄弟元素的margin-top
  - 一个元素（height为auto）的margin-bottom和它最后一个子元素的margin-bottom
  - 一个没有创建BFC、没有子元素、height为0的元素自身的margin-top和margin-bottom

以上就是margin collapse产生的原因，所有解决margin collapse的方法无非就是破坏了它成立条件。

解决mragin collapse除了以上打破生成条件，css3提供了一个新的概念：BFC（块级格式化上下文Block Formatting Context）

#### BFC

> 浮动元素和绝对定位元素，非块级盒子的块级容器，以及overflow值不为“visible”的块级盒子，都会为他们的内容创建新的块级格式化上下文（block formating context）

bfc并不是一个属性，也不是一段代码，而是css中基于box的一个布局对象，它是页面中的一块渲染区域，并且有一套渲染规则，它决定了其子元素将如何定位，以及和其他元素的关系和相互作用。明确的<u>，它是一个独立的盒子，并且这个独立的盒子内部布局不受到外界影响，当然，BFC也不会影响到外面的元素。</u>

##### 成为BFC的条件

至少满足以下条件中的任意一个

1. `float`值不为none
2. `position`值不为static或relative
3. `display`的值为table-cell, table-caption, inline-block, flex, inline-flex中的其中一个
4. `overflow`的值不为visible
5. 根元素

##### 如何触发BFC

1. `display:table; `，这种情况前后带有换行符，一般不用
2. `overflow: scroll;`，可能会出现意想不到的滚动条
3. `float: left;`，可能我们并不想让元素浮动
4. <u>`overflow: hidden;`，比较完美的解决方案，副作用很小。</u>

##### BFC可以解决的问题

1. margin塌陷的问题，这也是我们引入bfc的主要原因

   给塌陷的元素加入overflow:hidden;属性就可以了，因为bfc不会影响其他元素的布局，也不会被影响～～

2. 清除浮动

   有一种情况：父元素高度自适应，子元素浮动，因为不在同一文档流中，父元素的高度会坍塌

   此时只需要给父元素转为BFC即可，<u>因为在计算BFC的高度时，浮动元素也会计算在内。</u>

3. 实现两栏布局

   因为bfc区域不会与浮动盒子的区域叠加，因此在实现两栏布局的时候aside左浮动，那么主要内容的盒子就可以设置overflow: hidden;转为bfc。

#### border

##### 应用：用border+伪元素实现对话框的三角

```css{15-17}
.bubble{
    background-color: blue;
    position: relative;
    width: 200px;
    height: 100px;
    margin: 50px auto;
}
.bubble::after{
    content:'';
    width: 0;
    height: 0;
    position: absolute;
    top: 20px;
    left: -10px;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    border-right: 10px solid blue;
}
```

### 伪类与伪元素

1. 伪类表示被选择元素的某种状态
2. 伪元素表示的是被选择元素的某个部分，这个部分看起来像一个独立的元素，但是是“假”元素，没有dom实体，也不能被js操作，只存在于css中

### css函数

#### attr()

用来选择元素的属性值，用法：attr(html元素的属性名)，正常搭配css content一起使用

#### calc()

动态计算长度值

注意：

- 运算符前后都要用空格
- 不管什么长度都可以用calc计算

##### 用calc实现水平垂直居中

1. 父元素相对定位
2. 子元素绝对定位
3. 设置元素偏移量，值为`50%减去子盒子宽度/高度的一半`

css代码如下

```css
.box{
    position: relative;
    width: 200px;
    height: 300px;
    background-color: red;
}
.child{
    width: 10px;
    height: 10px;
    position: absolute;
    left: calc(50% - 5px);
    top: calc(50% - 5px);
    background-color: blue;
}
```

#### linear-gradient()

创建一个线性渐变的图像，需要设置一个起点一个方向，还可以自定义角度起始颜色等。

#### radial-gradient()

径向渐变创建图像，渐变由中心点定义，必须设置两个终止色。

#### repeating-linear-gradient()

创建重复的线性渐变图像

### 可继承的和不可继承的属性

#### 无继承的属性

- display
- 文本属性
  - vertical-align
  - text-decoration
  - text-shadow
  - white-space
  - unicode-bidi
- 盒子模型属性: width, height, margin, border, padding
- 背景属性: background, background-color, background-image, background-repeat, background-position, background-attachment
- 定位属性：float, clear, position, top, right, bottom, left, mini-width, mini-height, max-width, max-height, overflow, clip, z-index
- 生成内容属性：content, counter-reset, counter-increment
- 轮廓样式属性：outline-style, outline-width, outline-color, outline
- 页面样式属性：size, page-break-before, page-break-after
- 声音样式属性：pause-before, pause-after, pause, cue-before, cue-after, cue, play-during

#### 有继承的属性

- 字体系列属性：

  - font-family
  - font-weight
  - font-size
  - font-style

- 文本系列属性

  - text-indent
  - text-align
  - line-height
  - word-spacing
  - letter-spacing
  - text-transform
  - color

- 元素可见性

  -  visibility

- 列表布局属性

  - list-style

- 光标属性

  - cursor

  ### display属性

#### display:none;

将元素与其子元素从普通文档流中移除。此时文档的渲染就像元素从来没有存在过一样，也就是说它所占据的空间消失了，元素的内容也会消失。

#### display: block;

- block元素会独占一行，多个block元素会各自新起一行。默认情况下，block元素宽度会自动填满
- 块级元素即使设置了宽度，仍然独占一行。块级元素在完成宽度的情况下，通过自定义margin-right来自动填满一行，这个时候你设置margin-right是无效的；块级元素在没有设置宽度的情况下，margin-right会生效，块级元素的width通过自定义在自动填满一行。

#### display: inline;

- inline元素不会独占一行，多个相邻的行内元素会排列在同一行里，直到一行排列不下，才会新换一行，其宽度随元素的内容而变换。
- inline元素设置width、height属性无效
- inline元素的margin和padding属性，水平方向的padding-left、padding-right、margin-left、margin-right都会产生边距效果；但竖直方向的padding-top、padding-bottom、margin-top、margin-bottom不会产生边距效果。（<u>竖直方向的边距不生效</u>）

#### display: inline-block;

- 将对象呈现为inline对象，但是对象的内容作为block对象呈现，之后的内联对象会被排列在同一行内。结合了inline和block特性，既能设置宽高，也不会换行

#### inline-block引起的空白间隙问题

##### 问题原因：

元素被当成行内元素排版的时候，元素之间的空白符（空格、回车换行等）都会被浏览器处理，根据white-space的处理方式，默认是normal，合并多余空白原来html代码中的回车换行被转为一个空白符，所以元素之间就出现了空隙，这些元素之间的间距会随着不同的环境而变化（字族，字体大小，white-space都会影响）

通俗来讲就是，inline-block、block、inline的元素中的文本如果是换行符，默认情况下会渲染成空格，从而导致文字之间存在空白。两个inline-block盒子之间也会有空白。

##### 解决

1. 使用浮动

   左侧的盒子使用浮动，可以消除这种空白。

   缺点

   - 浮动会造成高度坍塌等不好操作
   - 特定场合还需要去清除浮动

2. 手动清除行内块元素之间的空格和换行符

   不建议，代码不美观，大部分格式化程序会强制换行。

3. 父元素设置font-size: 0;

   间距产生的原因主要是由于换行符被转义成空白符，这个宽度是由font-size控制的，我们可以将父元素的font-size设置为0；

   缺点：font-size可以继承，此时需要单独给子元素设置font-size

   `推荐这种方法`

4. 父元素设置word-spacing

   word-spacing属性可以增加或者减少字符与字符之间的空白，通过给父元素设置word-spacing为负值，达到消除间距的作用。

   缺点：可能会影响父元素里的其他元素



### 隐藏元素的方法有哪些

- display: none;

  脱离文档流、影响页面布局、不能触发事件、transition动画过渡无效

- visibility: hidden;

  不能触发事件，子元素会继承，可以通过visibility: visible;来显示子元素； transition动画过渡无效

- opacity: 0;

  能触发事件，子元素可以继承，但是不能通过给子元素设置opacity来重新显示，transition过渡动画有效。

- height:0; overflow:hidden;
- position:absolute; left: -9999px;
- transform: scale(0)

### link和@import的区别

两者都是外部引用css的方式，它们的区别如下：

- 用法：link在head中，@import在css文件或者style标签中

- link是XHTML标签，除了加载css外，还可以定义RSS等其他事务；@import属于css范畴，只能加载css
- link引用css时，在页面载入时同时加载；@import需要等加载包含它的css文件后加载。
- link是异步操作，遇到link不会开辟新的http线程去获取资源，gui继续渲染页面；@import是同步的gui渲染页面的时候遇到@import会等他获取新的样式回来后继续渲染。
- link是XHTML标签，无兼容问题；@import是css2.1提出的，低版本的浏览器不支持
- link支持使用javascript控制dom去改变样式；而@import不支持

#### link优点

link rel属性值可以为preload、prefetch、dns-prefetch

- preload更关注当前页面的资源加载优先级，为当前显示的页面做优化
- prefetch关注其他页面的资源加载，为未来用户可以进入的页面做优化
- dns-prefetch关注跨域资源的请求，提前做好了dns

link标签可以通过js动态插入到文档中；js中可以通过生成一个link标签然后设置href属性来引用样式

#### @import缺点

@import是依赖css的，存在一定的兼容问题，并且根据浏览器渲染机制来说，他在dom树渲染完成后才会渲染，并不能被js动态修改，会**阻塞加载**

link权重高于@import，因此@import适用于引入公共基础样式或者第三方样式，link适用于自己写的且需要动态修改的样式

使用导入样式的缺点：

1. @import样式只能放在style标签第一行，放在其他行会无效
2. @import声明的样式表不能充分利用浏览器并发请求资源的行为，其加载行为往往会延后处罚或者被其他资源加载挂起
3. 由于@import样式表的延后加载，可能会导致页面样式闪烁

### transition和animation的区别

- transition是过渡属性，强调过渡，它的视线需要触发一个事件才执行动画，只有两种状态，开始->结束
- animation是动画属性，它的实现不需要触发事件，设定好时间之后可以根据设定好的逻辑执行，并且可以循环，可以设置多个关键帧

### css动画性能优化

#### 渲染原理分析

[渲染页面：浏览器的工作原理](https://developer.mozilla.org/zh-CN/docs/Web/Performance/How_browsers_work)

提高动画性能，首先要理解浏览器是如何渲染一个页面的。

从服务器拿到数据后，浏览器会先做解析三类东西

- 解析html，xhtml，svg这三类文档，形成dom树
- 解析css，产生css rule tree
- 解析js，js会通过api来操作dom tree 和 css rule tree

解析完成之后，浏览器引擎会通过dom tree和css rule tree 来构建rendering tree
