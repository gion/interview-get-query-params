# getQueryParams — interview exercise

Implement `getQueryParams` in [`src/getQueryParams.ts`](src/getQueryParams.ts).

```ts
getQueryParams("https://example.com/page?a=foo&b=bar&c=something&c=somethingElse");
// => { a: "foo", b: "bar", c: ["something", "somethingElse"] }
```

The requirements are in the TODO comment. The test suite in
[`src/getQueryParams.test.ts`](src/getQueryParams.test.ts) covers repeated keys,
decoding, empty values, hashes, URL validation and some tricky keys.

## Run it

**In the browser:** [Open in StackBlitz](https://stackblitz.com/github/gion/interview-get-query-params) — tests start in watch mode automatically.

**Locally:**

```bash
npm install
npm test        # watch mode
npm run test:run
npm run typecheck
```
