export class Config {
  static onError = (
    error: any,
    funcName: string,
    kind: "computed" | "methods" | "watch"
  ) => {
    console.error(
      "[react vue state error]:\n",
      `${kind} => ${funcName} => ${error}`
    );
  };
}
