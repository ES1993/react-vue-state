import { Context } from "./context";
import { Data } from "./data";
import { Computed } from "./computed";
import { Methods } from "./methods";
import { Watch } from "./watch";

export class Store<T, D, C, M, W> {
  constructor(
    public context: T,
    public data: D,
    public computed: C,
    public methods: M,
    public watch: W
  ) {}
}

export const createStore = <
  D extends { [K: string]: any },
  C extends { [K: string]: () => any },
  M extends { [K: string]: (...args: any[]) => any },
  WD extends { [K in keyof D]?: (newValue: D[K], oldValue: D[K]) => any },
  WC extends {
    [K in keyof C]?: (
      newValue: ReturnType<C[K]>,
      oldValue: ReturnType<C[K]>
    ) => any;
  }
>(
  base?: {
    data?: D;
    computed?: C & ThisType<D>;
  },
  ext?: {
    methods?: M;
    watch?: WD & WC;
  } & ThisType<
    D & C & M & Pick<Context<Data<D>, Computed<C>, Methods<M>>, "setData">
  >
) => {
  const context = new Context<Data<D>, Computed<C>, Methods<M>>();
  const data = new Data(context, base?.data ?? ({} as D));
  const computed = new Computed(context, base?.computed ?? ({} as C));
  const methods = new Methods(context, ext?.methods ?? ({} as M));
  const watch = new Watch(context, (ext?.watch ?? {}) as any);
  const store = new Store(context, data, computed, methods, watch);

  return store;
};
