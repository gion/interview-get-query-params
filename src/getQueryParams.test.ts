import { describe, expect, it } from "vitest";
import { getQueryParams } from "./getQueryParams";

const base = "https://example.com/page";

describe("getQueryParams", () => {
  describe("basics", () => {
    it("parses a single param", () => {
      expect(getQueryParams(`${base}?a=foo`)).toEqual({ a: "foo" });
    });

    it("parses multiple params", () => {
      expect(getQueryParams(`${base}?a=foo&b=bar`)).toEqual({ a: "foo", b: "bar" });
    });

    it("matches the example from the task", () => {
      const url = `${base}?a=foo&b=bar&c=something&c=somethingElse`;
      expect(getQueryParams(url)).toEqual({
        a: "foo",
        b: "bar",
        c: ["something", "somethingElse"],
      });
    });

    it("returns a plain object", () => {
      const result = getQueryParams(`${base}?a=1`);
      expect(typeof result).toBe("object");
      expect(Array.isArray(result)).toBe(false);
    });
  });

  describe("repeated keys", () => {
    it("collects a repeated key into an array", () => {
      expect(getQueryParams(`${base}?c=x&c=y`)).toEqual({ c: ["x", "y"] });
    });

    it("keeps collecting when a key repeats 3+ times, in order", () => {
      expect(getQueryParams(`${base}?c=1&c=2&c=3&c=4`)).toEqual({ c: ["1", "2", "3", "4"] });
    });

    it("handles repeated keys that are not adjacent", () => {
      expect(getQueryParams(`${base}?c=1&a=x&c=2`)).toEqual({ c: ["1", "2"], a: "x" });
    });

    it("keeps empty values inside arrays", () => {
      expect(getQueryParams(`${base}?c=&c=2`)).toEqual({ c: ["", "2"] });
    });
  });

  describe("no / empty query", () => {
    it("returns {} when there is no query string", () => {
      expect(getQueryParams(base)).toEqual({});
    });

    it("returns {} for a lone '?'", () => {
      expect(getQueryParams(`${base}?`)).toEqual({});
    });

    it("returns {} when only a hash is present", () => {
      expect(getQueryParams(`${base}#section`)).toEqual({});
    });
  });

  describe("empty keys and values", () => {
    it("maps a key without '=' to an empty string", () => {
      expect(getQueryParams(`${base}?a`)).toEqual({ a: "" });
    });

    it("maps a key with '=' but no value to an empty string", () => {
      expect(getQueryParams(`${base}?a=`)).toEqual({ a: "" });
    });

    it("ignores empty segments from '&&' and a trailing '&'", () => {
      expect(getQueryParams(`${base}?a=1&&b=2&`)).toEqual({ a: "1", b: "2" });
    });

    it("keeps everything after the first '=' as the value", () => {
      expect(getQueryParams(`${base}?token=abc==&eq=a=b=c`)).toEqual({
        token: "abc==",
        eq: "a=b=c",
      });
    });
  });

  describe("decoding", () => {
    it("decodes percent-encoded values", () => {
      expect(getQueryParams(`${base}?name=John%20Doe`)).toEqual({ name: "John Doe" });
    });

    it("decodes '+' as a space", () => {
      expect(getQueryParams(`${base}?q=hello+world`)).toEqual({ q: "hello world" });
    });

    it("decodes an encoded '+' as a literal plus", () => {
      expect(getQueryParams(`${base}?sum=1%2B1`)).toEqual({ sum: "1+1" });
    });

    it("decodes encoded reserved characters (& = ?)", () => {
      expect(getQueryParams(`${base}?v=a%26b%3Dc%3F`)).toEqual({ v: "a&b=c?" });
    });

    it("decodes percent-encoded keys", () => {
      expect(getQueryParams(`${base}?first%20name=Ana`)).toEqual({ "first name": "Ana" });
    });

    it("decodes multi-byte UTF-8", () => {
      expect(getQueryParams(`${base}?city=Ia%C8%99i`)).toEqual({ city: "Iași" });
    });

    it("handles raw unicode in the URL", () => {
      expect(getQueryParams(`${base}?emoji=🚀`)).toEqual({ emoji: "🚀" });
    });

    it("does not throw on malformed percent-encoding", () => {
      expect(() => getQueryParams(`${base}?bad=%E0%A4%A`)).not.toThrow();
    });
  });

  describe("hash", () => {
    it("does not include the #hash in the last value", () => {
      expect(getQueryParams(`${base}?a=1&b=2#section`)).toEqual({ a: "1", b: "2" });
    });

    it("treats a '?' inside the hash as part of the hash", () => {
      expect(getQueryParams(`${base}?a=1#frag?b=2`)).toEqual({ a: "1" });
    });
  });

  describe("URL validation", () => {
    it("throws a TypeError for a non-URL string", () => {
      expect(() => getQueryParams("not a url")).toThrow(TypeError);
    });

    it("throws a TypeError for an empty string", () => {
      expect(() => getQueryParams("")).toThrow(TypeError);
    });

    it("throws a TypeError for a relative URL", () => {
      expect(() => getQueryParams("/page?a=1")).toThrow(TypeError);
    });

    it("throws a TypeError for a bare query string", () => {
      expect(() => getQueryParams("?a=1")).toThrow(TypeError);
    });

    it("accepts other schemes and URLs with port / credentials", () => {
      expect(getQueryParams("http://user:pass@localhost:3000/x?a=1")).toEqual({ a: "1" });
      expect(getQueryParams("ftp://files.example.com/?a=1")).toEqual({ a: "1" });
    });
  });

  describe("tricky keys (prototype safety)", () => {
    it("handles keys that exist on Object.prototype", () => {
      expect(getQueryParams(`${base}?toString=a&constructor=b&hasOwnProperty=c`)).toEqual({
        toString: "a",
        constructor: "b",
        hasOwnProperty: "c",
      });
    });

    it("stores '__proto__' as an own key without polluting prototypes", () => {
      const result = getQueryParams(`${base}?__proto__=x&a=1`);
      expect(Object.prototype.hasOwnProperty.call(result, "__proto__")).toBe(true);
      expect(Object.getOwnPropertyDescriptor(result, "__proto__")?.value).toBe("x");
      expect(result.a).toBe("1");
      expect(({} as Record<string, unknown>).x).toBeUndefined();
    });

    it("does not leak state between calls", () => {
      getQueryParams(`${base}?a=1`);
      expect(getQueryParams(`${base}?b=2`)).toEqual({ b: "2" });
    });
  });
});
