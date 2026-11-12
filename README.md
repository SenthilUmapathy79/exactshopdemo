# Product catalog

This is the existing ExactShopDemoApp Exact native application. Its manifest, bundle ID,
and framework checkout are unchanged. There are no React or external UI dependencies.

## Data and navigation

`app.contract` declares root resources `categories` and `products`. Exact invokes the
matching `loadCategories` / `loadProducts` entries through `app.ts`'s generated `Answer`
interface. The module grants `net.fetch https://fakestoreapi.com`, validates both responses,
and projects products into the precise Contract shape (including optional rating text).
Thrown HTTP, network, or validation errors drive Exact's resource failure states and Retry.

The local empty-string category value labels the first option **All Categories**; other
values come unchanged from the API. `shown` filters the loaded collection without I/O.
Rows push `/product/:id`; detail content resolves that ID against the same root resource.
There is no detail source or `/products/{id}` request. `stack(nav)` retains the listing
screen, its category state and its scroll container while a detail is open. Missing IDs
show a fallback and Back action. Images load independently from their API-provided URLs.

## Commands

```sh
bun exact.mjs contract build app.contract --json --errors-only
bun exact.mjs web                 # browser preview
bun exact.mjs ios --run           # build/install/launch on iOS Simulator
bun exact.mjs verify              # web tests and layout checks
bun exact.mjs verify ios          # native tests and layout checks
bun exact.mjs share               # generate an iPhone installation link
```

`app.test.contract` checks live API data, filtering, USD formatting, detail content,
back navigation, retained category, missing IDs, and failure/retry. These integration
checks use FakeStoreAPI's sample data, so service outages or sample changes can fail them.
The offline navigation test disables API access after the initial reads.

Additional controlled browser checks exercise pending resources and an empty response:

```sh
bun exact.mjs web --port 54321
# In another terminal (uses this checkout's playwright-core and installed Chrome):
node tools/catalog-browser-check.mjs
```

API instrumentation logs `catalog GET /products/categories` and `catalog GET /products`.
To inspect request counts across a complete journey:

```sh
bun exact.mjs agent web 'clock data' 'type category electronics' 'tap product-9' \
  'clock settle' 'clock data' 'tap back' 'clock settle' logs
```

The trace should contain only the two initial catalog calls. Browser and console copies
of a log line describe the same call; product-image downloads are separate from API reads.
