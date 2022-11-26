# react-vue-state

react state management, the usage is similar to vue's state management

English · [简体中文](./README.zh-cn.md)

# install

```zsh
npm install react-vue-state
```

# useage

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

# detail

```typescript
import { createStore, useStore, Config } from "react-vue-state";

/**
 * Override global error handling
 * error: specific error message
 * funcName: The name of the function where the error occurred
 * kind: Errors that occur in computed, methods, watch, setData
 */
Config.onError = (error: any, funcName: string, kind: string) => {
  console.log(kind, funcName, error);
  // do something
};

/**
 * createStore(base,ext)
 * base = { data:{}; computed:{}; }
 * ext = { methods:{}; watch:{}; }
 * Why split into 2 parameters:
 * Dividing into 2 parameters can have better typescript type deduction and ide type hints than synthesizing one parameter
 */
const store = createStore(
  {
    /**
     * used to store state
     * The corresponding ui will be re-rendered when the state changes
     */
    data: {
      firstName: "Li",
      lastName: "Hua",
    },
    /**
     * computed property
     * His "this" is "data"
     * Can't use arrow functions
     * When the state of the data used in the function changes, the new value will be recalculated
     * This is not calculated every time but when it is used
     */
    computed: {
      fullName() {
        return `${this.firstName} ${this.lastName}`;
      },
    },
  },
  {
    /**
     * The storage method is similar to the action used to modify the data state
     * His "this" is data, computed, methods and setData()
     * Divided into synchronous and asynchronous methods
     * To modify the state of data can only be modified by this.setData()
     * The asynchronous method will generate a [key]Running state property to notify the execution start and end
     */
    methods: {
      syncFunc() {
        const firstName = `${this.firstName} (^_^)`;
        this.setData({ firstName });
      },
      async asyncFunc() {
        // do some asynchronous task
        // Similar to network request
        const firstName = `${this.firstName} (^_^)`;
        this.setData({ firstName });
      },
    },
    /**
     * Execute when data and computed state changes
     * His "this" is data, computed, methods and setData()
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
   * Can only destructure the value to be used
   * Can't use const obj = useStore(store); via obj.xxx
   * Different components refer to different states
   * Only when the state changes, the referenced component will re-render
   * Example: A Component Reference Status X B Component Reference Status Y
   * When the Y state changes, only the B component reRender
   * Although they "useStore" the same store
   */
  const {
    firstName,
    lastName,
    fullName,
    asyncFunc,
    asyncFuncRunning,
    setData,
  } = useStore(store);

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
          asyncFunc();
        }}
      >
        test
      </button>
    </div>
  );
}
```
