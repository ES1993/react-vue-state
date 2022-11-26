export const isAsyncFunction = (res: any) => {
  if (
    !!res &&
    typeof res === "object" &&
    "then" in res &&
    typeof res["then"] === "function" &&
    "catch" in res &&
    typeof res["catch"] === "function" &&
    "finally" in res &&
    typeof res["finally"] === "function"
  ) {
    return true;
  }

  return false;
};
