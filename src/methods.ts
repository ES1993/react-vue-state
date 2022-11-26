import { Config } from "./config";
import { Context } from "./context";
import { State } from "./state";
import { isAsyncFunction } from "./util";

class MethodsState<V = any> extends State<V> {
  setValue = (value: V) => {
    if (this.value !== value) {
      const oldValue = this.value;
      this.value = value;
      this.emit(oldValue);
    }
  };
}

export class Methods<M extends { [K: string]: (...args: any[]) => any } = any> {
  state = {} as {
    [K: string]: MethodsState;
  };
  func = {} as { [K: string]: (...args: any[]) => any };

  constructor(private context: Context, public methods: M) {
    for (const key in methods) {
      if (key in context.data.state || key in context.computed.state) {
        throw new Error(
          `"data","methods" and "computed" has the same key:[${key}]`
        );
      }
      if (
        `${key}Running` in context.data.state ||
        `${key}Running` in context.computed.state
      ) {
        throw new Error(
          `"data" and "computed" can not be used [${key}Running] as key`
        );
      }
      this.func[key] = this.handlefunc.bind(this, key, methods[key]);
      this.state[`${key}Running`] = new MethodsState(false);
    }
    context.initMethods(this);
  }

  private handlefunc = (
    key: string,
    func: (...args: any) => any,
    ...args: any[]
  ) => {
    try {
      const methodsState = this.state[`${key}Running`] as MethodsState;
      methodsState.setValue(true);
      const res = func.call(this.context.funcThis, ...args);
      if (isAsyncFunction(res)) {
        return (res as Promise<any>)
          .catch((error) => {
            Config.onError(`methods ${func.name} => ${error}`);
          })
          .finally(() => {
            methodsState.setValue(false);
          });
      } else {
        methodsState.setValue(false);
        return res;
      }
    } catch (error) {
      Config.onError(`methods => ${func.name} => ${error}`);
    }
  };
}
