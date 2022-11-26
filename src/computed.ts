import { Config } from "./config";
import { Context } from "./context";
import { Data } from "./data";
import { State } from "./state";

class ComputedState<V = any> extends State<V> {
  private dirty = true;
  private readonly funcThis = new Proxy(
    {},
    {
      get: (_, key: string) => {
        if (key in this.context.data.state) {
          this.context.data.state[key].on(this.update);
        }
        return this.context.funcThis[key];
      },
    }
  );

  constructor(private context: Context<Data<any>>, private func: () => V) {
    super(null!);
  }

  private catchFunc = () => {
    try {
      return this.func.call(this.funcThis);
    } catch (error) {
      Config.onError(error, this.func.name, "computed");
      return this.value;
    }
  };

  getValue = () => {
    if (this.dirty) {
      const value = this.catchFunc();
      this.setValue(value);
    }

    return this.value;
  };

  setValue = (value: V) => {
    if (this.value !== value) {
      this.value = value;
      this.dirty = false;
    }
  };

  private update = () => {
    this.dirty = true;
    this.emit(this.value);
  };
}

export class Computed<C extends { [K: string]: () => any } = any> {
  state = {} as {
    [K in keyof C]: ComputedState;
  };

  constructor(context: Context, public computed: C) {
    if ("setData" in computed) {
      throw new Error(`can not be used [setData] as key`);
    }
    for (const key in computed) {
      if (key in context.data.state) {
        throw new Error(`"data" and "computed" has the same key:[${key}]`);
      }
      const state = new ComputedState(context, computed[key]);
      this.state[key] = state;
    }
    context.initComputed(this);
  }
}
