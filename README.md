# Product Catalog — Expo Exact Demo

A simple native iOS product catalog application built using **[Expo Exact](https://github.com/expo/exact)**, demonstrating declarative UI development with Contract, TypeScript-based API integration, native navigation, and local state management.

The application uses [FakeStoreAPI](https://fakestoreapi.com/) to display a list of products, with category filtering and navigation to a Product Detail Page (PDP).

### Features

- **Product Listing Page (PLP):** Displays products with thumbnails, titles, categories, and prices.
- **Category filtering:** Dynamically loads available categories, with *All Categories* selected by default.
- **Product Detail Page (PDP):** Displays product information, including its image, description, price, and rating.
- **Native navigation:** Navigate between the product listing and detail screens while retaining the selected category.
- **Local data reuse:** Product details are obtained from the previously loaded product collection, without additional product-detail API requests.
- **Loading and error handling:** Handles API loading, failures, empty results, and retry actions.

## Built with Expo Exact

This application is an experiment with **Expo Exact**, exploring its Contract-based UI architecture, native rendering, resource management, and navigation capabilities.

Unlike React Native applications, Expo Exact uses a compiled Contract UI definition and a Rust-based native runtime rather than React components.

**Prerequisites and setup**

This repository contains only the demo application. It depends on a separate checkout of the Expo Exact framework for compilation and execution.

Please refer to the official [Expo Exact GitHub repository](https://github.com/expo/exact) for instructions on installing Rust, Bun, Xcode, and other required dependencies, as well as setting up the framework.

The demo project must be placed alongside the `exact` framework directory:

```text
Projects/
├── exact/                  # Expo Exact framework
└── exactshopdemo/          # This demo application
    ├── app.contract
    ├── app.ts
    ├── app.test.contract
    └── ...
```

The project was developed and tested on the **iOS Simulator only**. Other platforms have not been evaluated as part of this experiment.

## Data and navigation

`app.contract` declares root resources `categories` and `products`. Exact invokes the matching `loadCategories` and `loadProducts` entries through the generated `Answer` interface implemented in `app.ts`.

The TypeScript module grants network access to `https://fakestoreapi.com`, validates both API responses, and maps products into the Contract data shape, including optional rating information.

HTTP, network, and validation errors are handled through Exact's resource failure states, with support for retry actions.

**Product navigation**

Selecting a product navigates to `/product/:id`.

The detail screen resolves the selected product ID against the existing root `products` resource.

- `stack(nav)` retains the listing screen, selected category, and scroll container during detail navigation.
- Missing product IDs display a fallback message and Back action.
- Product images load independently using the image URLs provided by FakeStoreAPI.

## Build and run — iOS

After completing the Expo Exact framework setup, navigate to the demo application directory.

**Generate the iOS native project:**

```sh
bun exact.mjs ios --prebuild
```

**Build and launch on the iOS Simulator:**

```sh
bun exact.mjs ios --run
```

These are the commands used during this experiment.

The demo has been exercised on the iOS Simulator. Browser, Android, macOS, and other platform workflows have not been tested.

## References

- [Expo Exact — Official GitHub Repository](https://github.com/expo/exact)
- [FakeStoreAPI](https://fakestoreapi.com/)