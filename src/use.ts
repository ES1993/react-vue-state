import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { Computed } from "./computed";
import { Context } from "./context";
import { Data } from "./data";
import { Methods } from "./methods";
import { Store } from "./store";
import { Watch } from "./watch";

type ObjFuncToObj<T extends Record<string, () => any>> = {
  [K in keyof T]: ReturnType<T[K]>;
};

type ObjAsyncFunckKeys<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => Promise<any> ? K : never;
}[keyof T];

type Running<T> = T extends string ? `${T}Running` : never;

export const useStore = <
  T extends Context,
  D extends Data,
  C extends Computed,
  M extends Methods,
  W extends Watch,
  S extends Store<T, D, C, M, W>
>(
  store: S
) => {
  const tag = useRef(true);
  const keys = useMemo(() => new Set<string>(), []);

  const [_, setNum] = useState(0);

  const update = useCallback(() => {
    if (tag.current) {
      setNum((num) => num + 1);
    }
  }, []);

  const proxy = useMemo(() => {
    const proxy = new Proxy(
      {} as { setData: S["context"]["setData"] } & S["data"]["data"] &
        ObjFuncToObj<S["computed"]["computed"]> &
        S["methods"]["methods"] & {
          [K in Running<ObjAsyncFunckKeys<S["methods"]["methods"]>>]: boolean;
        },
      {
        set: () => {
          throw new Error('use "setData" to change data');
        },
        get: (_, key: string) => {
          if (!keys.has(key)) {
            keys.add(key);
          }

          if (key in store.data.state) {
            const state = store.data.state[key];
            state.on(update);
            return state.getValue();
          }

          if (key in store.computed.state) {
            const state = store.computed.state[key];
            state.on(update);
            return state.getValue();
          }

          if (key in store.methods.state) {
            const state = store.methods.state[key];
            state.on(update);
            return state.getValue();
          }

          if (key in store.methods.func) {
            return store.methods.func[key];
          }

          if (key === "setData") {
            return store.context.setData;
          }
        },
      }
    );

    return proxy;
  }, []);

  useEffect(() => {
    tag.current = true;
    return () => {
      tag.current = false;
      keys.forEach((key) => {
        if (key in store.data.state) {
          store.data.state[key].off(update);
        }

        if (key in store.computed.state) {
          store.computed.state[key].off(update);
        }

        if (key in store.methods.state) {
          store.methods.state[key].off(update);
        }
      });
    };
  }, []);

  return proxy;
};
