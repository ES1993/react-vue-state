# react-vue-state

react 状态管理，使用方式类似于 vue 的状态管理

[English](./README.md) · 简体中文

# 安装

```zsh
npm install react-vue-state
```

# 快速使用

```typescript
import { createStore, useStore } from "react-vue-state";

const store = createStore({
  data: {
    count: 22,
  },
});

export default function () {
  const { count, setData } = useStore(store);

  return (
    <div>
      <div>{count}</div>
      <button
        onClick={() => {
          setData({ count: count + 1 });
        }}
      >
        add
      </button>
    </div>
  );
}
```

# 详情

```typescript
import { createStore, useStore, useFunc, Config } from "react-vue-state";

/**
 * 覆盖全局的错误处理
 * error 具体错误信息
 * funcName 发生错误的函数名称
 * kind 在computed,methods,watch,setData那个中发生的错误
 */
Config.onError = (error: any) => {
  console.log(error);
  // do something
};

/**
 * createStore(base,ext)
 * base = { data:{}; computed:{}; }
 * ext = { methods:{}; watch:{}; }
 * 为什么要分成2个参数：
 * 比起合成一个参数，分成2个参数可以拥有有更好typescript类型推导和ide类型提示
 */
const store = createStore(
  {
    /**
     * 用来存储状态
     * 状态发生变化相应的ui就会重新渲染
     */
    data: {
      firstName: "Li",
      lastName: "Hua",
    },
    /**
     * 计算属性
     * 他的this是data
     * 不能使用箭头函数
     * 当函数内中用到的data的状态发生变化时，就会重新计算出新的值
     * 这个不是每次都计算而是当使用到的时候才会计算
     */
    computed: {
      fullName() {
        return `${this.firstName} ${this.lastName}`;
      },
    },
  },
  {
    /**
     * 存放方法 类似于action 用来修改data状态
     * 他的this是 data，computed，methods 以及 setData()
     * 分成同步方和异步方法
     * 要修改data的状态只能通过 this.setData() 来修改
     * 异步方法会产生一个 [key]Running 的状态属性 用来通知 执行开始和结束
     */
    methods: {
      syncFunc() {
        const firstName = `${this.firstName} (^_^)`;
        this.setData({ firstName });
      },
      async asyncFunc() {
        // 做一些 异步 任务
        // 类似 网络请求
        const firstName = `${this.firstName} (^_^)`;
        this.setData({ firstName });
      },
    },
    /**
     * 当data和computed状态发生变化执行
     * 他的this是 data，computed，methods 以及 setData()
     */
    watch: {
      firstName(newValue, oldValue) {
        // do something
      },
      async fullName(newValue, oldValue) {
        // do something
      },
    },
  }
);

export default function () {
  /**
   * useStore
   * 只能解构 要用到的值
   * 不能 const obj = useStore(store); 通过 obj.xxx 使用
   * 不同的组件引用不同的状态
   * 只有当状态发生变化 引用的组件才会重新render
   * 列：A组件引用状态X B组件引用状态Y
   * 当Y状态变化的时候只有B组件render
   * 虽然他们 useStore 了同一个 store
   */
  const {
    firstName,
    lastName,
    fullName,
    asyncFunc,
    asyncFuncRunning,
    setData,
  } = useStore(store);

  /**
   * 任何函数在运行时都可能会产生错误
   * useFunc不仅可以捕获错误还能保证组件在ReRender后地址不会发生改变
   */
  const task = useFunc(async () => {
    await asyncFunc();
  });

  return (
    <div>
      <div>asyncFuncRunning:{`${asyncFuncRunning}`}</div>
      <div>firstName:{firstName}</div>
      <div>lastName:{lastName}</div>
      <div>fullName:{fullName}</div>
      <button
        onClick={() => {
          setData({ firstName: "Yang" });
        }}
      >
        setData 1
      </button>
      <button
        onClick={() => {
          setData(({ firstName }) => ({ firstName: firstName + "Yang" }));
        }}
      >
        setData 2
      </button>

      <button
        onClick={() => {
          task();
        }}
      >
        test
      </button>
    </div>
  );
}
```
