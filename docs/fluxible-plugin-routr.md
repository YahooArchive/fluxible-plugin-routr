# Routr Plugin API

## Constructor(options)

Creates a new routr plugin instance with the following parameters:

 * `options`: An object containing the plugin settings
 * `options.routes` (required): Stores your routes configuration

## Instance Methods

### getRoutes

getter for the `routes` option passed into the constructor.

```
pluginInstance.getRoutes(); // returns the full routes object passed to factory
```

## actionContext Methods

Provides full access to the routr instance. See [routr docs](https://github.com/yahoo/routr) for more information.

 * `actionContext.router.makePath(routeName, routeParams)`: Create a URL based on route name and params
 * `actionContext.router.getRoute(path)`: Returns matched route
