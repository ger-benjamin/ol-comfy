# ol-comfy

[![CI](https://github.com/ger-benjamin/ol-comfy/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/ger-benjamin/ol-comfy/actions/workflows/ci.yml)

Comfortable and convenient Openlayers helpers for standard usages.

This library provides a good help to answer common Openlayers needs in a web application using web-components:

- Adds identifier to layers, interactions and controls to be able to get and mange them in every component.
- Add some observables for features and for layer-group. They are stored stably in the map and accessible without worrying about
  the observed layer or feature.
- Simplify drawing: enable one tool at once, manage interactions (create, store, destroy).
- Add some utils, shortcut and helpers function.

Ol-Comfy is built in a non-binding manner: take only what you need, extend what you need. Every classe is responsible for what
they manage and store/retrieve information in/from the map. This way you can destroy an instance, create another one and find
again the same state.

## Improvements and warning

This library is currently not used directly and used only in one project.

It's currently not a npm package.

Not everything is tested, but between UIT and example, the coverage is not bad.

It's an advanced v0, but still not a v1.

Some features will be added over the time.

## Online doc and demos

- [Documentation](https://ger-benjamin.github.io/ol-comfy/apidoc/index.html);
- [Demo](https://ger-benjamin.github.io/ol-comfy/demo/examples/index.html);

## Local development

For local development we use a few demos.

```bash
npm install
npm run dev
```

