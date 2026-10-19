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
  // TODO: implement.
  //
  // Requirements:
  //  - single keys map to a string:            ?a=foo        -> { a: "foo" }
  //  - repeated keys map to an array (ordered): ?c=x&c=y      -> { c: ["x", "y"] }
  //  - keys and values are URL-decoded (`+` is a space)
  //  - a key without a value maps to "":        ?a  or  ?a=   -> { a: "" }
  //  - the #hash is not part of the query
  //  - no query string returns {}
  //  - an invalid URL throws a TypeError
  //
  // Run `npm test` and make the suite green.
  throw new Error("Not implemented");
}
