/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*globals describe,it,beforeEach */
'use strict';

var expect = require('chai').expect;
var routrPlugin = require('../../../lib/routr-plugin');
var createStore = require('fluxible/utils/createStore');
var Fluxible = require('fluxible');

var RoutesStore = createStore({
    storeName: 'RoutesStore',
    handlers: {
        'RECEIVE_ROUTES': 'receiveRoutes'
    },
    initialize: function() {
        this.routes = {};
    },
    receiveRoutes: function(routes) {
        this.routes = routes;
        this.emitChange();
    }
});

describe('fetchrPlugin', function () {
    var app,
        pluginInstance,
        context,
        routes1 = {
            view_user: {
                path: '/user/:id',
                method: 'get',
                foo: {
                    bar: 'baz'
                }
            },
            view_user_post: {
                path: '/user/:id/post/:post',
                method: 'get'
            }
        },
        routes2 = {
            view_second: {
                path: '/second/:id',
                method: 'get',
                foo: {
                    bar: 'all'
                }
            }
        },
        pluginOptionsDynRoutes = {
            storeName: RoutesStore.storeName,
            storeEvent: 'change',
            dehydrateRoutes: function(routes) { return routes; },
            rehydrateRoutes: function(routes) { return routes; }
        };

    function actionContextRoutes1(actionContext) {
        expect(actionContext.router).to.be.an('object');
        expect(actionContext.router.makePath).to.be.a('function');
        expect(actionContext.router.getRoute).to.be.a('function');
        expect(actionContext.router.makePath('view_user', {id: 1})).to.equal('/user/1');
    }
    function componentContextRoutes1(componentContext) {
        expect(componentContext.makePath).to.be.a('function');
        expect(componentContext.makePath('view_user', {id: 1})).to.equal('/user/1');
    }
    function actionContextRoutes2(actionContext) {
        expect(actionContext.router).to.be.an('object');
        expect(actionContext.router.makePath).to.be.a('function');
        expect(actionContext.router.getRoute).to.be.a('function');
        expect(actionContext.router.makePath('view_second', {id: 2})).to.equal('/second/2');
    }
    function componentContextRoutes2(componentContext) {
        expect(componentContext.makePath).to.be.a('function');
        expect(componentContext.makePath('view_second', {id: 2})).to.equal('/second/2');
    }

    beforeEach(function () {
        app = new Fluxible();
    });

    describe('static routes', function() {
        beforeEach(function() {
            pluginInstance = routrPlugin({ routes: routes1 });
            app.plug(pluginInstance);
            context = app.createContext();
        });

        describe('factory', function () {
            it('should accept static routes option', function () {
                expect(pluginInstance.getRoutes()).to.deep.equal(routes1);
            });
        });

        describe('actionContext', function () {
            var actionContext;
            beforeEach(function () {
                actionContext = context.getActionContext();
            });
            describe('router', function () {
                it('should have a router access', function () {
                    actionContextRoutes1(actionContext);
                });
            });
        });

        describe('componentContext', function () {
            var componentContext;
            beforeEach(function () {
                componentContext = context.getComponentContext();
            });
            describe('router', function () {
                it('should have a router access', function () {
                    componentContextRoutes1(componentContext);
                });
            });
        });

        describe('rehydrate/dehydrate', function() {
            it('should not have plugin rehydrate/dehydrate', function() {
                expect(pluginInstance.dehydrate).to.be.an('undefined');
                expect(pluginInstance.rehydrate).to.be.an('undefined');
            });
            it('should not have a context rehydrate/dehydrate', function() {
                var contextPlug = pluginInstance.plugContext();
                expect(contextPlug.dehydrate).to.be.an('undefined');
                expect(contextPlug.rehydrate).to.be.an('undefined');
            });
        });
    });

    describe('dynamic routes', function() {
        beforeEach(function() {
            pluginInstance = routrPlugin(pluginOptionsDynRoutes);
            app.plug(pluginInstance);
            app.registerStore(RoutesStore);
            context = app.createContext();
        });

        describe('factory', function () {
            it('should not have any routes defined', function () {
                expect(pluginInstance.getRoutes()).to.be.an('undefined');
            });
        });

        describe('dehydrate/rehydrate', function() {
            var dehydratedState = {
                routes: pluginOptionsDynRoutes.dehydrateRoutes(routes1)
            };
            it('should have context rehydrate/dehydrate', function() {
                var contextPlug = pluginInstance.plugContext();
                expect(contextPlug.dehydrate).to.be.a('function');
                expect(contextPlug.rehydrate).to.be.a('function');
            });
            describe('rehydrate', function() {
                beforeEach(function() {
                    context.rehydrate({
                        plugins: {
                            RoutrPlugin: dehydratedState
                        }
                    });
                });
                it('should have routes', function() {
                    expect(pluginInstance.getRoutes()).to.eql(routes1);
                });
                describe('actionContext', function() {
                    var actionContext;
                    beforeEach(function() {
                        actionContext = context.getActionContext();
                    });
                    it('should have a router access', function () {
                        actionContextRoutes1(actionContext);
                    });
                });
                describe('componentContext', function() {
                    var componentContext;
                    beforeEach(function() {
                        componentContext = context.getComponentContext();
                    });
                    it('should have a router access', function () {
                        componentContextRoutes1(componentContext);
                    });
                });
            });
            describe('dehydrate', function() {
                var contextPlug;
                beforeEach(function() {
                    contextPlug = pluginInstance.plugContext();
                    contextPlug.rehydrate(dehydratedState);
                });
                it('should dehydrate using dehydrateRoutes', function() {
                    expect(contextPlug.dehydrate(routes1)).to.eql(dehydratedState);
                });
            });
        });

        describe('updateRoutes', function() {
            var actionContext;
            beforeEach(function() {
                actionContext = context.getActionContext();
            });
            it('should update with routes1 when store updates', function() {
                actionContext.dispatch('RECEIVE_ROUTES', routes1);
                expect(pluginInstance.getRoutes()).to.eql(routes1);
            });
            it('should update with routes2 when store updates', function() {                
                actionContext.dispatch('RECEIVE_ROUTES', routes2);
                expect(pluginInstance.getRoutes()).to.eql(routes2);
            });
            describe('context updates', function() {
                describe('routes1', function() {
                    describe('actionContext', function() {
                        it('should have a router access', function () {
                            actionContext.dispatch('RECEIVE_ROUTES', routes1);
                            actionContextRoutes1(actionContext);
                        });
                    });
                    describe('componentContext', function() {
                        var componentContext;
                        beforeEach(function() {
                            componentContext = context.getComponentContext();
                        });
                        it('should have a router access', function () {
                            actionContext.dispatch('RECEIVE_ROUTES', routes1);
                            componentContextRoutes1(componentContext);
                        });
                    });
                });
                describe('routes2', function() {
                    describe('actionContext', function() {
                        it('should have a router access', function (){
                            actionContext.dispatch('RECEIVE_ROUTES', routes2);
                            actionContextRoutes2(actionContext);
                        });
                    });
                    describe('componentContext', function() {
                        var componentContext;
                        beforeEach(function() {
                            componentContext = context.getComponentContext();
                        });
                        it('should have a router access', function () {
                            actionContext.dispatch('RECEIVE_ROUTES', routes2);
                            componentContextRoutes2(componentContext);
                        });
                    });
                });
            });
        });
    });
});
