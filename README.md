# Routr Plugin for Fluxible

[![npm version](https://badge.fury.io/js/fluxible-plugin-routr.svg)](http://badge.fury.io/js/fluxible-plugin-routr)
[![Build Status](https://travis-ci.org/yahoo/fluxible-plugin-routr.svg?branch=master)](https://travis-ci.org/yahoo/fluxible-plugin-routr)
[![Dependency Status](https://david-dm.org/yahoo/fluxible-plugin-routr.svg)](https://david-dm.org/yahoo/fluxible-plugin-routr)
[![devDependency Status](https://david-dm.org/yahoo/fluxible-plugin-routr/dev-status.svg)](https://david-dm.org/yahoo/fluxible-plugin-routr#info=devDependencies)
[![Coverage Status](https://coveralls.io/repos/yahoo/fluxible-plugin-routr/badge.png?branch=master)](https://coveralls.io/r/yahoo/fluxible-plugin-routr?branch=master)

Provides routing methods to your [Fluxible](https://github.com/yahoo/fluxible) application using [routr](https://github.com/yahoo/routr).

## Usage

```js
var Fluxible = require('fluxible');
var routrPlugin = require('fluxible-plugin-routr');
var app = new Fluxible();

var pluginInstance = routrPlugin({
    routes: {
        user: {
            path: '/user/:id',
            method: 'get',
            // flux-router-component uses this action when the route is matched
            action: function (actionContext, payload, done) {
                // ...
                done();
            }
        }
    }
});

app.plug(pluginInstance);
```
[//]: # (API_START)
## Routr Plugin API

### Constructor(options)

Creates a new fetchr plugin instance with the following parameters:

 * `options`: An object containing the plugin settings
 * `options.routes` (required): Stores your routes configuration

### Instance Methods

#### getRoutes

getter for the `routes` option passed into the constructor.

```
pluginInstance.getRoutes(); // returns the full routes object passed to factory
```

### actionContext Methods

Provides full access to the routr instance. See [routr docs](https://github.com/yahoo/routr) for more information.

 * `actionContext.router.makePath(routeName, routeParams)`: Create a URL based on route name and params
 * `actionContext.router.getRoute(path)`: Returns matched route
[//]: # (API_STOP)

## License

This software is free to use under the Yahoo! Inc. BSD license.
See the [LICENSE file][] for license text and copyright information.

[LICENSE file]: https://github.com/yahoo/fluxible-plugin-routr/blob/master/LICENSE.md
