# HTML基础

## 语义化标签

### 定义

语义化是根据内容的结构化（内容语义化），选择合适的标签（代码语义化）。

### 优点

1. 有利于seo，对机器友好，对于一些读屏软件可以根据文章自动生成目录
2. 对开发者友好，增强代码可读性，结构更清晰。

### 语义化标签

```html
<header></header> 头部
<nav></nav> 导航栏
<section></section> 区块（有语义化的div）
<main></main> 主区域
<article></article> 主要内容
<aside></aside> 侧边栏
<footer></footer> 底部
```

## Doctype作用

DOCTYPE是HTML5中一种标准通用标记语言的<u>文档类型声明</u>。

它告诉浏览器应该以什么样的文档类型解析文档，不同的渲染模式会影响浏览器对css代码甚至js脚本的解析，因此它<u>必须声明在html文档的第一行</u>。

### 浏览器渲染两种模式

1. CSS1Compat：标准模式(Strick mode)，默认模式，浏览器使用W3C的标准解析渲染页面。在默认模式下，浏览器以支持最高的标准呈现页面。
2. BlackCompat：怪异模式（混杂模式 quick mode），浏览器使用自己的怪异模式解析渲染页面。在怪异模式中，页面以一种比较宽松的向后兼容方式显示。

## Meta标签有哪些？有什么作用

Meta标签由`name`和`content`属性定义，用来描述**网页文档的属性**，相当于网页的元属性。

### 常用的Meta标签

1. `charset`，描述html文档编码类型

   ```html
   <meta charset='utf-8'/>
   ```

   

2. `keywords`页面关键词

   ```html
   <meta name='keywords' content='关键词1 关键词2' />
   ```

   

3. `description`页面描述

   ```html
   <meta name='description' content='这是一个博客～'/>
   ```

   

4. `refresh`页面重定向和刷新

   ```html
   <meta http-equiv='refresh' content='0;url=' />
   ```

   

5. `viewport`适配移动端，可以控制视口大小和比例

   ```html
   <meta name='viewport' content='width=device-width, initial-scale=1' />
   ```

   viewport的content参数有以下几种

   - `width`:宽度（一个数值或者device-width设备宽度）
   - `height`:高度(一个数值或者device-height设备高度)
   - `initial-scale`：初始缩放比例
   - `max-scale`：最大缩放比例
   - `minimum-scale`：最小缩放比例
   - `user-scalable`：是否允许用户缩放（yes/no）

6. 搜索引擎搜索方式

   ```html
   <meta name='robots' content='index, follow'/>
   ```

   其中content有以下的参数可选：

   - `all`：文件将被检索，且页面上的链接可以被查询
   - `none`：文件不可被检索，且页面上的链接不可以被查询
   - `index`：文件将被检索
   - `follow`：页面上的链接可以被查询
   - `noindex`：文件将不被检索
   - `nofollow`：页面上的链接将不可以被检索

## 行内元素、块级元素、空元素

1. 行内元素：`a span img input select strong button`

2. 块级元素：`div p h1 h2 h3 h4 h5 h6 ul li ol dt`

3. 空元素：没有内容的html元素。没有闭合标签

   `br hr img input link meta`

## src和href有什么区别

1. `src`是指向外部资源的位置。指向的内容会嵌入到文档标签所在的位置，请求src资源时会将其指向的资源下载并应用到文档内，如js脚本、img图片和frame元素。

   > [!WARNING]
   >
   > 当浏览器解析到该类元素时，会暂停其他资源的下载和处理，直到将该元素加载、编译、执行完毕。因此js脚本一般会放在html底部，而不是头部，因为默认js的加载和执行是阻塞的。

2. `href`是指向网络资源所在位置（超链接），用来建立当前元素与文档之间的连接。浏览器识别到它指向的文件时，会并行下载资源，不会停止对当前文件的处理。

### 资源预加载

#### prefetch

利用浏览器空闲时间来下载或预取用户在不久的将来可能访问的文档。

```html
<link href='/js/ss.js' rel='prefetch'>
```



#### preload

指明哪些资源是在页面**加载完后立即需要**的，浏览器在主渲染机制介入前就进行预加载，这一机制使得资源可以更早的得到加载并可用，且不容易阻塞页面的初步渲染，进而提升性能。

```html
<link href='/js/xx.js' rel='preload' as='script'>
```

其中`as`可以指定资源类型，目前可用属性如下：

- `audio`：音频文件
- `document`：一个将要被嵌入到`<frame>`或者`<iframe>`内部的html文档
- `embed`：一个将要被嵌入到`<embed>` 元素内部的资源
- `fetch`：哪些将要通过fetch和xhr请求来获取的资源，比如一个ArrayBuffer或JSON文件。
- `font`：字体文件
- `image`：图片文件
- `object`：一个将会被嵌入到`<embed>`元素内的文件
- `script`：javascript文件
- `style`：样式表
- `track`：webVTT文件
- `worker`一个javascript的web worker或者shared worker
- `video`：视频文件

## script标签中的defer与async的区别

默认情况下，浏览器会立即加载并执行相应的脚本，会阻塞后续文档的加载。

加入defer或async属性都是去异步加载外部的js文件，他们都不会阻塞页面的解析。

区别：

1. 执行顺序：多个async属性的script标签没有先后顺序；多个带有defer的标签，按照加载顺序执行。
2. 脚本是否并行执行：async属性，表示后续文档的加载和执行与js脚本的加载和执行是并行的，也就是异步执行；defer属性，文档的加载和js的加载是并行的，但是此时js并不执行，等到文档所有元素解析完成js才会执行，但也会早于DOMContentLoaded事件触发之前执行。

## offset、scroll、client的区别

### client

- `oEvent.clientX`：鼠标到可视区左边框的距离

- `oEvent.clientY`：鼠标到可视区上边框的距离

- `clientWidth`：可视区的宽度

- `clientHeight`：可视区的高度

- `clientLeft`：获取左边框的宽度

- `clientTop`：获取上边框的宽度

  ### offset

  - `offsetWidth`：div的宽度，包括边框
  - `offsetHeight`：div的高度，包括边框
  - `offsetLeft`：div到整个页面左边框的距离，不包括div的边框
  - `offsetTop`：div到整个页面上边框的距离，不包括div的边框

  ### scroll

  - `scrollTop`可视区顶部边框与整个页面上部边框看不到的区域（垂直滚动了多少）
  - `scrollLeft`可视区左边边框与整个页面左边边框看不到的区域（水平滚动了多少）
  - `scrollWidth`左边看不到的区域加可视区加右边看不到的区域，也就是整个页面的宽度
  - `scrollHeight`整个页面的高度

  ## img标签中的title和alt

  - title：滚动到元素上的时候显示
  - alt：img的等价描述符，图片无法加载时显示、读屏器阅读图片。

  ## iframe的使用

  ### iframe基础

  src属性指定具体页面地址

  ```html
  <iframe src="sandbox.html"></iframe>
  ```

  还能设置什么属性？

  - frameborder：是否显示边框，1/0
  - height：高度，可以在css中设置
  - width：宽度，可以在css中设置
  - name：iframe的名称，使用window.frames[name]访问时的专用属性
  - scrolling：框架是否能滚动，yes/no/auto
  - src：内框架的地址，可以使用页面地址

### 特点

1. iframe会阻塞主页面的Onload事件
2. 搜索引擎的检索程序无法解读这种页面，不利于seo
3. iframe和主页面共享连接池，而浏览器对相同域的连接有限制，所以会影响页面的并行加载
4. 使用iframe之前需要考虑上述的缺点。避免这些问题可以使用javascipt动态给iframe添加src属性，这样就能绕开这两个问题

## canvas和svg有什么区别

### svg

可缩放矢量图形(Scalable Vector Graphics)，是基于可扩展标记语言XML描述的2D图形，svg基于xml就意味着svg dom中的每个元素都是可用的，可以为某个元素附加javascript事件处理器。

在svg中，每个被绘制的图形均被视为对象，如果svg对象的属性发生变化，那么浏览器能够自动重现图形。

特点：

- 不依赖分辨率
- 支持事件处理器
- 最适合带有大型渲染区域的应用程序（比如谷歌地图）
- 复杂度高会减慢渲染速度（任何过度使用dom的应用都不快）
- 不适合游戏应用

### canvas

canvas是画布，通过javascript来绘制2d图形，是逐像素进行渲染的，其位置发生改变，就会重新进行绘制。

特点：

- 依赖分辨率
- 不支持事件处理器
- 弱的文本渲染能力
- 能够以.png或.jpg格式保存结果图像
- 最合适图像密集型的游戏，其中的许多对象会被频繁绘制

## H5的离线存储



离线存储指的是：用户在没有与因特网连接的时候，可以正常访问站点或应用，在于因特网连接之时，更新用户机器上的离线文件。

### 原理

基于新建`.appcache`文件的缓存机制（并不是存储技术），通过这个文件上的解析清单离线存储资源，这些资源就会像cookie一样被存储了下来，之后当网络处于离线状态时，浏览器会通过被离线存储的数据进行页面显示。

### 使用

1. 创建一个与html同名的manifest文件，在html标签头部加入manifest属性

2. 在cache.manifest文件中写入需要离线存储的资源

   ```
   CACHE MANIFEST
   	#v0.11
   	CACHE:
   	js/app.js
   	css/style.css
   	NETWORK:
   	resourse/logo.png
   	FALLBACK:
   	/ /offline.html
   ```

   - CACHE：表示需要离线存储的资源列表，由于包含manifest文件的页面会被自动离线存储，因此不需要把页面本身也列出来
   - NETWORK：表示在它下面列出来的资源只有在在线的情况下才能访问，他们不会被离线存储，所以在离线情况下无法使用这些资源。但是如果CACHE和NETWORK中有相同的资源，那么会被优先离线存储
   - FALLBACK：表示如果第一个资源失败，那么就使用第二个资源来替换他，比如上边这个文件表示的就是如果访问根目录下任何一个资源失败了，那么就去访问offline.html

3. 离线时，操作`window.applicationCache`进行离线存储的操作

### 如何更新缓存

1. 更新manifest文件
2. 通过javascript操作
3. 清除浏览器缓存

### 浏览器如何对html离线存储资源进行管理和加载

- 在线情况：浏览器发现html头部有manifest属性，它会请求manifest文件。
  - 如果是在第一次访问app，那么浏览器会根据manifest文件的内容下载相应的资源并进行离线存储；
  - 如果已经访问过app并且资源已经离线存储了，那么浏览器会使用离线的资源加载页面，然后会对比新的manifest与旧的manifest文件，如果文件没有发生变化，就不做任何操作，如果文件改变了，那么就重新下载文件中的资源并进行离线存储
- 离线情况下：浏览器直接使用离线资源

## H5的新特性

### 语义化标签

- header：文档页眉
- nav：导航连接
- footer：文档页脚
- article：文章内容
- section：文章章节
- aside：侧边

### 媒体标签

1. audio ：音频
2. video：视频
3. source：兼容不同浏览器，用来指定视频源

### 表单

#### 表单类型

- email
- url
- number
- search
- range
- color
- time
- data
- datatime
- datatime-local
- week
- month

### 进度条、度量器

- progress标签：表示任务进度

  - max：总进度
  - value：已完成多少

- meter标签：表示剩余容量、库存等，设置一个高低范围，低于或者大于高低范围会显示警告颜色

  - high/low：高低范围
  - max/min：最大最小，这个范围应该要包含着高低范围
  - value：当前容量

  ### DOM查询操作

  - document.querySelector()
  - document.querySelectorAll()

### Web存储

html5提供了两种在客户端存储数据的新方法

- localStorage：没有时间限制的数据存储，除非手动删除或者程序清除，否则永远不会消失
- sessionStorage：针对一个会话的数据存储，单个标签页，标签页关闭就会被清除

### 其他

- 拖放
- 画布canvas
- svg
- 地理定位