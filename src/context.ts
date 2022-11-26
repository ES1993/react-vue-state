import { Computed } from "./computed";
import { Config } from "./config";
import { Data } from "./data";
import { Methods } from "./methods";

export class Context<
  D extends Data = any,
  C extends Computed = any,
  M extends Methods = any
> {
  data!: D;
  computed!: C;
  methods!: M;

  funcThis = new Proxy({} as any, {
    set: () => {
      throw new Error('use "this.setData" to change data');
    },
    get: (_, key: string) => {
      if (key in this.data.state) {
        return this.data.state[key].getValue();
      }

      if (key in this.computed.state) {
        return this.computed.state[key].getValue();
      }

      if (key in this.methods.state) {
        return this.methods.state[key].getValue();
      }

      if (key in this.methods.func) {
        return this.methods.func[key];
      }

      if (key === "setData") {
        return this.setData;
      }
    },
  });

  initData = (data: D) => {
    this.data = data;
  };

  initComputed = (computed: C) => {
    this.computed = computed;
  };

  initMethods = (methods: M) => {
    this.methods = methods;
  };

  setData = (
    state: Partial<D["data"]> | ((data: D["data"]) => Partial<D["data"]>)
  ) => {
    const values = (() => {
      try {
        return typeof state === "function" ? state(this.funcThis) : state;
      } catch (error) {
        Config.onError(`setData => ${error}`);
        return {} as Partial<D["data"]>;
      }
    })();

    for (const key in values) {
      this.data.state[key].setValue(values[key]);
    }
  };
}
