export const formatJson = (obj: unknown): string =>
  JSON.stringify(
    obj,
    (_, value) => (typeof value === "bigint" ? value.toString() : value),
    2
  );
