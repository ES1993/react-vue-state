export class Config {
  static onError = (
    error: any,
    funcName: string,
    kind: "computed" | "methods" | "watch" | "context"
  ) => {
    console.error(
      "[react vue state error]:\n",
      `${kind} => ${funcName} => ${error}`
    );
  };
}
