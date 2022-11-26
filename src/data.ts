import { Context } from "./context";
import { State } from "./state";

class DataState<V = any> extends State<V> {
  setValue = (value: V) => {
    if (this.value !== value) {
      const oldValue = this.value;
      this.value = value;
      this.emit(oldValue);
    }
  };
}

export class Data<D = any> {
  state = {} as {
    [K in keyof D]: DataState;
  };

  constructor(context: Context, public data: D) {
    if ("setData" in data) {
      throw new Error(`can not be used [setData] as key`);
    }
    for (const key in data) {
      this.state[key] = new DataState(data[key]);
    }
    context.initData(this);
  }
}
