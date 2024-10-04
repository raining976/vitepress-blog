<aside>
📝 最终版我们实现了显式空闲链表对空闲内存的管理，大大提高了执行效率。

</aside>

# 作出的尝试

测试版我们写出了隐式空闲链表的方案，由于效率过低，没有使用内存复用，果断重构了代码，使用了显式的空闲链表来维护空闲内存。

比较遗憾的是没有使用分箱分别管理不同的空闲块大小，在查找空闲块的效率还是挺高的，不过理论部分我们都进行了研究，由于实验4的时间紧迫，因此并没有实现着方面的内容。

# 实现思路

在测试版单链表的基础上，最终版我们在思路上进行了很大范围的修改，添加了单独的空闲链表，并参考ptmalloc的实现也使用了内存复用的策略来存储空闲块和已分配块。

## 块结构的抽象设计

因为内存是按照8字节对齐的，所以块大小size的值最后三位一定为0，该三位二进制就可以用来存储一些别的标志信息，事实上libc中的ptmalloc也是这么做的。我们将最低位用来存储是否被分配的标识位，1表示该块已经被分配了，0表示该块是空闲块。

<aside>
✏️ 注意以下示意图一行代表8字节的大小，也就是64个bit。

</aside>

### 已分配块的结构

<aside>
📝 说明：后文出现的bp基地址表示的是有效荷载的起始地址，在空闲块中表示的是prev指针的起始地址。

</aside>

我们为有效荷载的前后添加一个脚部和一个头部，存储着该块的大小已经分配情况，至于为什么添加一个脚部，这与处理碎片合并有关系，虽然libc中的ptmalloc没有使用脚部的设定，但是同样的使用了“前一个块的大小（如果当前块空闲）”，这也是一种内存复用的技巧，因为前一个块的信息只有在当前块为空闲时才有用（合并碎片时判断前一个块的情况），但是为了方便实现，我们采用了添加脚部的这种技巧，这样当前块想要拿到上一个块的信息时，只需要将bp指针减去两个8B就可以。

![image-20241004191100305](https://gitee.com/raining976/markdown-imgs/raw/master/img/image-20241004191100305.png)

### 空闲块的结构

当块空闲时，头部后的两个8字节分别指向空闲链表中的前一个空闲块和下一个空闲块。

在该块被分配后，两个指针也就无意义了，因此可以用来被存储信息，增大了空间利用率。

这里需要注意的是，因为头部、脚部以及两个指针的存在（他们都是8B的大小），最小的块很显然应该是32B，因此在处理用户的申请的时候，我们应该做一个用户申请大小加16B与最小块的大小的判断，具体情况在malloc实现将会介绍。

![image-20241004191117643](https://gitee.com/raining976/markdown-imgs/raw/master/img/image-20241004191117643.png)

## 辅助函数介绍

<aside>
✍️ 这部分我们将基于上述的块结构的抽象，介绍操作堆空间的相关辅助函数，为malloc套件的实现作出铺垫。
</aside>

<aside>
‼️ 为了区分libc 中的ptmalloc和我们自己实现的malloc，下文将以mm来特指我们实现的版本。
malloc相关套件的函数名称与实验给定的不一致是因为，我额外封装了一层，将宏和一些变量限制在同一个文件中了，这样相对来说更安全了。allocator中的代码如下，辅助函数以及实现细节写在了mm.c中。

</aside>

```c
#include "./allocator_interface.h"
#include "allocator_chunk.h"
#include "mm.h"
#include <stdlib.h>
#define malloc(...) (USE_MY_MALLOC)
#define free(...) (USE_MY_FREE)
#define realloc(...) (USE_MY_REALLOC)

int my_check() { return mm_check(); }
int my_init() { return mm_init(); }
void *my_malloc(size_t size) { return mm_malloc(size); }
void my_free(void *ptr) { mm_free(ptr); }
void *my_realloc(void *ptr, size_t size) { return mm_realloc(ptr, size); }
```

### 一些常量宏以及工具宏的介绍

宏是编译过程的常量替换，因此比函数调用效率更高。

| 宏 | 备注 |
| --- | --- |
| WSIZE | 单字大小，64位操作系统为8B |
| DSIZE | 双字 |
| MIN_CHUNK_SIZE | 块size的最小值，为32B |
| CHUNKSIZE | 扩展堆的默认值，4KB |
| MAX(x,y) | 求x、y的最大值 |
| PACK(size,alloc) | 将size和alloc字段打包到一个字中 |
| GET_SIZE(p) | 从头部/脚部解析出size值 |
| GET_ALLOC(p) | 从头部/脚部解析出alloc值 |
| HDRP(bp) | 给定bp，获取当前块的头部 |
| FTRP(bp) | 给定bp，获取当前块的脚部 |
| GET_PREV(bp) | 获取空闲链表中当前块的前一个块 |
| SET_PREV(bp,val) | 修改当前空闲块指针域的prev值 |
| GET_SUCC(bp) | 获取空闲链表中当前块的后继空闲块 |
| SET_SUCC(bp) | 修改当前空闲块指针域的succ值 |
| NEXT_BLKP(bp) | 给定bp，获取下一个块的头部 |
| PREV_BLKP(bp) | 给定bp，获取前一个块的尾部，相当于拿到了前一个块的信息 |

### init 初始化

为了使得在合并块时对于前后块的判断统一化，我们在初始时申请了4个字的空间用来设置一个头块和一个尾块，并分别将头块标注为（16B，1），尾块标记为（0，1），（这里指的是大小和分配状态）。

这样在初始为空时，新加入的空闲块就可以判断前后块的状态了，省去了对于链表头和尾的额外判断，代码更加优雅了。

```c
// mm.c
int mm_init(void) {
  if ((heap_listp = mem_sbrk(4 * WSIZE)) == (void *)-1) {
    MM_ERROR("mem_sbrk failed");
    return -1;
  }

  PUT(heap_listp, 0);
  PUT(heap_listp + (1 * WSIZE), PACK(DSIZE, 1));
  PUT(heap_listp + (2 * WSIZE), PACK(DSIZE, 1));
  PUT(heap_listp + (3 * WSIZE), PACK(0, 1)); // 结尾块
  heap_listp += (2 * WSIZE);
  free_list_head = NULL;

  if ((extend_heap(CHUNKSIZE / WSIZE) == NULL)) {
    LOG_VAl("init fail!", (long)0);
    return -1;
  }
  assert(free_list_head != NULL && free_list_head != 0x0);
  return 0;
}
```

### extend heap堆扩展

这里的堆扩展是在这个模拟堆空间分配的50MB基础上进行的，我们规定一旦当前空闲链表中的块不能满足用户需求了，就向这50MB的模拟堆申请4KB的空间，交给mm管理。

<aside>
💡 为什么不是申请用户申请的大小？这里因为该模型中的mem_sbrk是在模拟系统调用，用户态与内核态的切换开销相对更大，因此我们选择申请一个大空间，交给mm维护即可，无需担心浪费问题，事实上ptmalloc也是这么做的。

</aside>

因此`extend_heap()` 的功能就是向模拟堆空间申请空间，然后交mm套件中的`coalesce()` 函数，该函数的功能是看看当前空闲块是否能和前一个/后一个块合并，然后将合并后（或者未进行合并）的块以头插法的形式插入到空闲链表。

值的注意的是，因为init时我们申请了一个尾块，大小为8B，紧挨着brk，这样在扩展堆时只需要将原来的尾块看作新bp的头部，然后额外将最后一个8B设定为新的尾块就可以了，设计非常的巧妙，这里鸣谢一下csapp的实验代码框架。

下面将给出该部分函数的代码：

```c
// mm.c
void *extend_heap(size_t words) {
  void *bp;
  size_t size;
  size = words * WSIZE;
  if ((long)(bp = mem_sbrk(size)) == -1) {
    return NULL;
  }
  // 初始化这个空块
  // 把上次的尾块当作新的header
  PUT(HDRP(bp), PACK(size, 0));
  PUT(FTRP(bp), PACK(size, 0));
  SET_PREV(bp, 0);
  SET_SUCC(bp, 0);
  // 将最后一个8字节看作为新的尾块
  PUT(HDRP(NEXT_BLKP(bp)), PACK(0, 1));
  return coalesce(bp);
}
```

### 加入/移出空闲链表

仅涉及链表的操作，不再赘述

```c
// mm.c
void remove_from_free_list(void *bp) {
  if (bp == NULL || GET_ALLOC(HDRP(bp)))
    return;
  void *prev = (void *)GET_PREV(bp);
  void *next = (void *)GET_SUCC(bp);
  SET_PREV(bp, 0);
  SET_SUCC(bp, 0);
  if (prev == NULL && next == NULL) {
    // 空闲链表只有这一个结点
    free_list_head = NULL;
  } else if (prev == NULL) {
    // 这是空闲链表的头结点
    SET_PREV(next, 0);
    free_list_head = next;
  } else if (next == NULL) {
    // 删除的是尾部结点
    SET_SUCC(prev, 0);
  } else {
    // 删除的中间结点
    SET_SUCC(prev, next);
    SET_PREV(next, prev);
  }
}

void insert_into_free_list(void *bp) {
  if (bp == NULL || bp == 0)
    return;
  if (free_list_head == NULL) {
    free_list_head = bp;
    return;
  }
  // 头插法更新空闲链表
  SET_SUCC(bp, free_list_head);
  SET_PREV(free_list_head, bp);
  free_list_head = bp;
}
```

### coalesce 合并块

为了处理碎片问题，我们加入了合并块的功能。

合并当前空闲块与其相邻的块，合并之前需要先判断前后两个块的分配情况，有如下四种情况。

1. 前后都已经分配
2. 前一个空闲，后一个已经分配。
3. 前一个已分配，后一个空闲
4. 前后都空闲

很显然，对于前后都分配的，无法合并，只需要将其加入到空闲链表中即可；对于其他三种情况，操作都是类似的，都是要先将原来的块从空闲链表中移除，不过需要注意的是，如果是将当前块与前一个块合并，需要将修改后的prev_bp赋值给当前bp，因为bp的含义是合并后的bp，如果和后一个合并，就不需要这样做，直观上只是将后一个块的尾部之前的内存与当前块的尾部都看做了荷载而已。

与此同时，合并时修改谁的头尾也要注意，如果是和前一个合并，则修改前一个的头和当前块的尾；如果和后一个合并，修改当前块的头和后一个块的尾部；如果是和前后两个合并，则修改前一个的头和后一个的尾。

最后将合并后的块加入到空闲链表。

```c
// mm.c
void *coalesce(void *bp) {
  void *prev_bp = PREV_BLKP(bp);
  void *next_bp = NEXT_BLKP(bp);

  size_t prev_alloc = GET_ALLOC(HDRP(PREV_BLKP(bp)));
  size_t next_alloc = GET_ALLOC(HDRP(NEXT_BLKP(bp)));

  size_t size = GET_SIZE(HDRP(bp)); // 当前块的大小

  if (prev_alloc && next_alloc) {
    // 两个块均已经分配 什么都不做
  } else if (prev_alloc && !next_alloc) {
    // 前一个块已分配 后一个块为空
    // 此时与后一个块合并
    remove_from_free_list(next_bp);
    size += GET_SIZE(HDRP(next_bp));
    // 更新当前块的头部和下一个块的脚部
    PUT(HDRP(bp), PACK(size, 0));
    PUT(FTRP(next_bp), PACK(size, 0));
  } else if (!prev_alloc && next_alloc) {
    // 前一个块空闲 后一个块已分配
    // 此时将当前块与前一个块合并
    remove_from_free_list(prev_bp);
    size += GET_SIZE(HDRP(prev_bp));
    // 更新当前块的脚部和前一个块的头部
    PUT(FTRP(bp), PACK(size, 0));
    PUT(HDRP(prev_bp), PACK(size, 0));

    // 更新当前块的指针
    bp = prev_bp;
  } else {
    // 前后两个块都为空
    // 合并这三个块
    remove_from_free_list(prev_bp);
    remove_from_free_list(next_bp);
    size += GET_SIZE(HDRP(prev_bp)) + GET_SIZE(HDRP(next_bp));
    // 设置前一个块的头部和下一个块的脚部
    PUT(HDRP(prev_bp), PACK(size, 0));
    PUT(FTRP(next_bp), PACK(size, 0));

    // 更新当前块的指针
    bp = prev_bp;
  }

  insert_into_free_list(bp);
  return bp;
}
```

### find-fit 查找块

这里我们仅使用了首次匹配，因为已经处理了碎片的问题，最佳匹配并没有很好的优势。next fit和首次匹配类似，只是加了个额外的变量存储上次访问的块而已。 细节不再赘述。

```c
// mm.c
static void *first_fit(size_t asize) {
  void *bp;

  for (bp = free_list_head; bp != 0 || bp != NULL; bp = (void *)GET_SUCC(bp)) {
    if (asize <= GET_SIZE(HDRP(bp))) {
      return bp;
    }
  }
  return bp;
}
```

### place 放置块

听起来很抽象，只不过是对一个小功能的额外封装，解决了内部碎片的问题。

这个函数的功能是将目标块信息修改（修改size和alloc），如果请求的size很小，则说明这个块有很大的空间不会被使用，就会导致内部碎片的问题，于是这个函数也有分裂当前块的功能。

很简单，不多解释了。

```c
void place(void *bp, size_t asize) {
  // 获取当前空闲块的大小
  size_t csize = GET_SIZE(HDRP(bp));
  // 将当前空闲块移出空闲链表
  remove_from_free_list(bp);

  // 如果当前空闲块与请求大小的差值超过了MIN_CHUNK_SIZE 说明可以分割
  if ((csize - asize) >= MIN_CHUNK_SIZE) {
    // 修改原来块的头部和脚部
    PUT(HDRP(bp), PACK(asize, 1));
    PUT(FTRP(bp), PACK(asize, 1));
    // 找到新块地址 初始化头脚后加入空闲链表
    void *new_bp = NEXT_BLKP(bp);
    PUT(HDRP(new_bp), PACK(csize - asize, 0));
    PUT(FTRP(new_bp), PACK(csize - asize, 0));
    // 将剩余位置的空闲块加入到空闲链表
    SET_PREV(new_bp, 0);
    SET_SUCC(new_bp, 0);
    coalesce(new_bp);
  } else {
    // 无法分割 则直接修改该块的头部和脚部
    PUT(HDRP(bp), PACK(csize, 1));
    PUT(FTRP(bp), PACK(csize, 1));
  }
}
```

### 总结

至此，我们介绍完了所有关于维护空闲链表以及分配堆的一些辅助函数，接下来的malloc套件的实现仅仅需要在此基础上进行就可以了，无需考虑链表的维护、堆空间的维护问题了。

## malloc套件的执行逻辑

<aside>
✍️ 这部分我们将会基于上述介绍，介绍malloc相关功能是如何实现的。

</aside>

### malloc

malloc是分配一段连续的堆空间，起始地址返回给用户。

基于上述模型的构建，则第一步要做的就是查找当前空闲链表中是否有满足该次需求的块，如果有，调用place放置该块，返回bp即可。

如果找不到满足要求的块，则需要调用extendheap扩展堆，此时调用place将块放置，返回bp即可。

```c
// mm.c
void *mm_malloc(size_t size) {
  size_t asize;
  size_t extend_size;
  char *bp;

  if (size == 0)
    return NULL;

  asize = MAX(MIN_CHUNK_SIZE, ALIGN(size + DSIZE));
  // 找合适的chunk块
  if ((bp = find_fit(asize)) != NULL) {
    place(bp, asize);
    return bp;
  }

  // 没有合适的空闲块 则向系统申请扩展堆空间
  extend_size = MAX(asize, CHUNKSIZE); // 放置默认扩展空间不能满足用户
  if ((bp = extend_heap(extend_size / WSIZE)) == NULL) {
    return NULL;
  }

  place(bp, asize);
  return bp;
}
```

### free

free最容易，先将目标块的信息修改（alloc字段改为0），此时变为了空闲块，多了两个指针域，因此不要忘记将这两个指针域初始为0，防止出现内存泄漏。

最后调用合并函数，看看能不能与前后的块合并，并加入到空闲链表中。

```c
// mm.c
void mm_free(void *ptr) {
  if (ptr == NULL)
    return;
  size_t size = GET_SIZE(HDRP(ptr));

  PUT(HDRP(ptr), PACK(size, 0));
  PUT(FTRP(ptr), PACK(size, 0));

  SET_PREV(ptr, 0);
  SET_SUCC(ptr, 0);

  coalesce(ptr);
}

```

### realloc

realloc的实现我们用了一个比较简单的思路，没有沿用测试版的相对复杂的思路，实现起来更加直接。

思路如下：

1. 直接调用malloc，保存这个返回的bp指针。
2. 判断新申请的大小与原来块的大小关系，如果更大，说明是扩展大小；如果更小，则需要截取。
3. 释放原来的bp， 返回新的bp

```c
void *mm_realloc(void *ptr, size_t size) {
  void *old_ptr = ptr;
  void *new_ptr;
  size_t copysize;

  if (ptr == NULL)
    return mm_malloc(size);
  if (size == 0) {
    mm_free(ptr);
    return NULL;
  }

  new_ptr = mm_malloc(size);

  size = GET_SIZE(HDRP(old_ptr)); // 原来块的大小
  copysize = GET_SIZE(HDRP(new_ptr)); // 要复制多少 这里涉及到缩小的问题
  if (copysize > size)
    copysize = size;

  memcpy(new_ptr, old_ptr, copysize - WSIZE);

  mm_free(old_ptr);
  return new_ptr;
}
```

> [!note]
>
> 📝 这里解释一下为什么不沿用原来的“看起来”更加精明的思路，其实主要原因就是前后的性能差别并不大，但是原来的思路实现起来却更麻烦，代码更臃肿，隐藏的危险更多，这是我们不愿意看到与面对的，因此舍弃了原来的思路。



### 总结

至此，实验要求的malloc套件已经全部完成，高度的模块化与解藕，由于是参考了csapp的malloc实验的框架，在此基础上并结合我们测试版以及ptmalloc源码进行的合并优化，虽然没有使用ptmalloc的分箱式管理，这非常的遗憾，理论上来说这部分的优化可以让性能更进一步，很可惜实验4的时间要求不允许我们再在实验3上浪费时间了，所以仅仅做到这种地步。

## 堆检查器

实验手册中还要求了对于堆的一致性的检查，针对我们的实现模型，对部分一致性问题进行了检查。

1. 检查空闲链表中的每个块是否都标记为了free
2. 检查空闲链表中的块是否还可以与前后合并
3. 检查块之间是否重叠
4. 检查是否超出了当前堆的brk位置

其中`CHECK_ERROR()`是为了方便打印信息写的宏：

```c
// mm.c
#define CHECK_ERROR(msg) fprintf(stderr, "CHECK_ERROR: %s\n", msg)
// 检查堆一致性
int mm_check() {
  char *bp;
  char *lo = (char *)mem_heap_lo();
  char *hi = (char *)mem_heap_hi() + 1;
  char *prev_bp, *next_bp;
  bp = free_list_head;
  while (lo <= bp && bp < hi) {
    // 1. 检查空闲链表中每个块是否标记为free
    if (GET_ALLOC(HDRP(bp))) {
      CHECK_ERROR("A chunk in a free linked list is not a free tag!");
      return -1;
    }
    // 2. 检查空闲链表中的相邻块是否仍然可以合并
    prev_bp = PREV_BLKP(bp);
    next_bp = NEXT_BLKP(bp);
    if (prev_bp && next_bp && GET_ALLOC(HDRP(prev_bp)) == 0 &&
        GET_ALLOC(HDRP(next_bp)) == 0) {
      CHECK_ERROR(
          "There are still chunks in the free linked list that can be merged!");
      return -1;
    }
    bp = (char *)GET_SUCC(bp);
  }

  size_t size;
  bp = heap_listp;
  while (lo <= bp && bp < hi) {
    size = GET_SIZE(HDRP(bp));
    next_bp = NEXT_BLKP(bp);
    if (next_bp && next_bp < hi) {
      // 3. 检查堆是否重叠
      if (bp + size > next_bp) {
        CHECK_ERROR("heap space is overlap!");
        return -1;
      }
    }

    bp = NEXT_BLKP(bp);
  }
  // 4. 检查是否超过堆地址空间
  if (bp != hi) {
    CHECK_ERROR("extend of heap space!");
    return -1;
  }
  return 0;
}

```

# 运行结果

shell中执行`make mdriver; ./mdriver -V -c` 

相比于libc的malloc，我们的mm_malloc的运行速度在某些样例中快了6-10倍，空间利用率平均也在80以上。

性能指数p为66（多次运行的结果）


‼️ 至于样例9的低性能问题，因为实验手册指明的仓库readme文件在我们的平台中仅有一个“project 3”字样，导致trace文件格式无从得知，这也导致我们无法针对某些极端情况对当前模型作出进一步的针对优化，从而出现了类似上图这种低表现的情况。

# 总结

总结来看，该实验我们的完成度仍然还可以进一步提高，比如针对libc中ptmalloc的分箱式管理空闲链表，不同的索引为不同的块大小的链表，这样做的好处是查找合适的块的时间复杂度由O(n)变成了）O(1)，效率可以说是大大提升了，唯一的问题就是增加额外的内部碎片，因为这种思路的简化版本一定是每个链表的块大小是固定的；进一步的解决思路是设立一个最小的块链表，其中存的是一些小于特定小的块的链表，这样可以进一步优化上述问题。

很可惜，我们有了实现思路，但是由于时间关系，实验四的动工迫在眉睫，因此实验三的最终版智能以此来结尾了。

经过这个实验，我们的收获颇丰，因为前期的准备工作很长，本人除了阅读大量相关博客以外，还研读了阿里华庭大佬写的《glibc内存管理ptmalloc源代码分析》（能力不够不足以段时间内理解libc的实现，因此找了源码的解析版本来理解），里面的大量内容对于我本次实验的有很大的启发作用，也为后期使用csapp实验框架带来了相当大的快速理解上的帮助，在此鸣谢。

再一次感叹，计算机世界还有许多值得我去探索的地方。