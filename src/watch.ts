import { Config } from "./config";
import { Context } from "./context";
import { Data } from "./data";
import { isAsyncFunction } from "./util";

export class Watch<W extends { [k: string]: (...args: any[]) => any } = any> {
  constructor(private context: Context<Data>, watch: W) {
    for (const key in watch) {
      if (key in context.data.state) {
        context.data.state[key].on(this.handFunc.bind(this, key, watch[key]));
      }
      if (key in context.computed.state) {
        context.computed.state[key].on(
          this.handFunc.bind(this, key, watch[key])
        );
      }
    }
  }

  private handFunc = (
    key: string,
    func: (...args: any[]) => any,
    ...args: any[]
  ) => {
    try {
      const newValue = (() => {
        if (key in this.context.data.state) {
          return this.context.data.state[key].getValue();
        }
        if (key in this.context.computed.state) {
          return this.context.computed.state[key].getValue();
        }
      })();
      const res = func.call(this.context.funcThis, newValue, ...args);
      if (isAsyncFunction(res)) {
        return (res as Promise<any>).catch((error) => {
          Config.onError(error);
        });
      }
    } catch (error) {
      Config.onError(error);
    }
  };
}
