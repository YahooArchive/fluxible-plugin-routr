/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var Router = require('routr');

module.exports = function routrPlugin(options) {
    options = options || {};
    var routes = options.routes;
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
            var router = new Router(routes);
            return {
                /**
                 * Provides full access to the router in the action context
                 * @param {Object} actionContext
                 */
                plugActionContext: function plugActionContext(actionContext) {
                    actionContext.router = router;
                },
                /**
                 * Provides access to create paths by name
                 * @param {Object} componentContext
                 */
                plugComponentContext: function plugComponentContext(componentContext) {
                    componentContext.makePath = router.makePath.bind(router);
                }
            };
        },
        /**
         * Called to dehydrate plugin options
         * @method dehydrate
         * @returns {Object}
         */
        dehydrate: function dehydrate() {
            return {
                routes: routes
            };
        },
        /**
         * Called to rehydrate plugin options
         * @method rehydrate
         * @returns {Object}
         */
        rehydrate: function rehydrate(state) {
            routes = state.routes;
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
