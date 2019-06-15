# kuspe ![npm](https://img.shields.io/npm/v/kuspe.svg?style=flat-square) [![Build Status](https://travis-ci.org/buosseph/kuspe.svg?branch=develop)](https://travis-ci.org/buosseph/kuspe)

kuspe provides an application plugin architecture with dependency resolution.

## Installation

`yarn add kuspe`

or 

`npm install --save kuspe`

kuspe is a ES2015, or ES6, package and requires the running environment to support [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) and [the iterable protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol).

## Usage

kuspe uses [Tarjan's algorithm](https://en.wikipedia.org/wiki/Tarjan's_strongly_connected_components_algorithm) to provide an array of extensions sorted by dependency order through the `ExtensionManager`.

```ts
import { Extension, ExtensionManager } from "kuspe";

// Add your own properties for your extensions
type AppExtension = Extension;

const a: AppExtension = {
	provides: ["a"]
	needs: [],
	uses: [],
	excludes: [],
	first: false,
	last: false
};

const b: AppExtension = {
	provides: ["b"],
	needs: ["a"],
	uses: [],
	excludes: [],
	first: false,
	last: false
};

const extensions: ExtensionManager<AppExtension> = new ExtensionManager();

extensions.register(b);
extensions.register(a);

// Extensions are returned in dependency order
console.log(extensions.order()); // [a, b]
```

kuspe also provides a `PluginManager` which returns an array of plugins in order of registration; no dependency resolution is included and any object may be used.

```ts
import { PluginManager } from "kuspe";

const plugins: PluginManager = new PluginManager();

const a = { name: "a" };
const b = { name: "b" };

plugins.register(b);
plugins.register(a);

// Plugins are returned in registration order
console.log(Array.from(plugins)); // [b, a]
```

## Prior Art

This package is based on the work included in [`marrow.package`](https://github.com/marrow/package#5-managing-plugins) for plugin management.

> What does "kuspe" mean?

It's a [Lojban gismu](//vlasisku.lojban.org/kuspe).