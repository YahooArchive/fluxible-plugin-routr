/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var debug = require('debug')('RoutrPlugin');
var Router = require('routr');

var passThru = function(routes) { return routes; };

module.exports = function routrPlugin(options) {
    options = options || {};

    var staticRoutes = options.routes;
    var storeName = options.storeName;
    var storeEvent = options.storeEvent;
    var dehydrateRoutes = options.dehydrateRoutes || passThru;
    var rehydrateRoutes = options.rehydrateRoutes || passThru;

    var routes = staticRoutes;

    /**
     * @class RoutrPlugin
     */
    return {
        name: 'RoutrPlugin',
        /**
         * Called to plug the FluxContext
         * @method plugContext
         * @returns {Object}
         */
        plugContext: function plugContext() {
            debug('new plug context');
            var router, actionContext, componentContext;

            if (staticRoutes) {
                router = new Router(routes);
            }

            /**
             * Dynamically update the routes, make a new Router, fix references.
             *
             * @param {Object} params
             * @param {Object} params.routes The new routes to supply Routr
             */
            var updateRoutes = function updateRoutes(params) {
                debug('updating routes');
                routes = params.routes;
                router = new Router(routes);
                if (actionContext) {
                    actionContext.router = router;
                }
                if (componentContext) {
                    componentContext.makePath = router.makePath.bind(router);
                }
            };

            var pluginContext = {
                /**
                 * Provides full access to the router in the action context
                 * @param {Object} actionContext
                 */
                plugActionContext: function plugActionContext(context) {
                    debug('plug action context, router = '+router);
                    actionContext = context;
                    actionContext.router = router;
          
                    if (!staticRoutes) {
                        // Update on a store event within the single round.
                        // Could be 'change' from dedicated route store, or
                        // a dedicated change event within an application store.
                        actionContext.getStore(storeName)
                            .removeListener(storeEvent, updateRoutes)
                            .on(storeEvent, updateRoutes);
                    }
                },
                /**
                 * Provides access to create paths by name
                 * @param {Object} componentContext
                 */
                plugComponentContext: function plugComponentContext(context) {
                    componentContext = context;
                    if (router) {
                        componentContext.makePath = router.makePath.bind(router);
                    }
                }
            };
      
            if (!staticRoutes) {
                // Allows context plugin settings to be persisted between server and client.
                // Called on server to send data down to the client
                pluginContext.dehydrate = function dehydrate() {
                  return { routes: dehydrateRoutes(routes) };
                };

                // Called on client to rehydrate the context plugin settings
                pluginContext.rehydrate = function rehydrate(state) {
                  updateRoutes({ routes: rehydrateRoutes(state.routes) });
                };
            }

            return pluginContext;
        },
        /**
         * @method getRoutes
         * @returns {Object}
         */
        getRoutes: function getRoutes() {
            return routes;
        }
    };
};
