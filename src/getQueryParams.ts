/**
 * A single query param value. Keys that appear more than once
 * are collected into an array, in the order they appear.
 */
export type QueryParamValue = string | string[];

/** Parsed query params, keyed by (decoded) param name. */
export type QueryParams = Record<string, QueryParamValue>;

/**
 * Parses the query string of an absolute URL into an object.
 *
 * @example
 * getQueryParams("https://example.com/page?a=foo&b=bar&c=x&c=y");
 * // => { a: "foo", b: "bar", c: ["x", "y"] }
 *
 * @param url - an absolute URL, e.g. "https://example.com/path?a=1"
 * @returns the parsed query params ({} when there are none)
 * @throws {TypeError} when `url` is not a valid absolute URL
 */
export function getQueryParams(url: string): QueryParams {
  // `new URL` throws a TypeError for invalid / relative URLs,
  // strips the #hash and handles decoding (incl. `+` as space).
  const { searchParams } = new URL(url);

  const result: QueryParams = {};

  for (const [key, value] of searchParams) {
    const existing = Object.prototype.hasOwnProperty.call(result, key)
      ? result[key]
      : undefined;

    let next: QueryParamValue;
    if (existing === undefined) next = value;
    else if (Array.isArray(existing)) next = [...existing, value];
    else next = [existing, value];

    // defineProperty so "__proto__" becomes an own key instead of a prototype setter
    Object.defineProperty(result, key, {
      value: next,
      enumerable: true,
      writable: true,
      configurable: true,
    });
  }

  return result;
}
