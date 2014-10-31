/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*globals describe,it,beforeEach */
"use strict";

var expect = require('chai').expect;
var routrPlugin = require('../../../lib/routr-plugin');
var FluxibleApp = require('fluxible-app');

describe('fetchrPlugin', function () {
    var app,
        pluginInstance,
        context,
        routes = {
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
        };

    beforeEach(function () {
        app = new FluxibleApp();
        pluginInstance = routrPlugin({
            routes: routes
        });
        app.plug(pluginInstance);
        context = app.createContext();
    });

    describe('factory', function () {
        it('should accept routes option', function () {
            expect(pluginInstance.getRoutes()).to.deep.equal(routes);
        });
    });

    describe('actionContext', function () {
        var actionContext;
        beforeEach(function () {
            actionContext = context.getActionContext();
        });
        describe('router', function () {
            it('should have a router access', function () {
                expect(actionContext.router).to.be.an('object');
                expect(actionContext.router.makePath).to.be.a('function');
                expect(actionContext.router.getRoute).to.be.a('function');
                expect(actionContext.router.makePath('view_user', {id: 1})).to.equal('/user/1');
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
                expect(componentContext.makePath).to.be.a('function');
                expect(componentContext.makePath('view_user', {id: 1})).to.equal('/user/1');
            });
        });
    });

    describe('dehydrate', function () {
        it('should dehydrate its state correctly', function () {
            expect(pluginInstance.dehydrate()).to.deep.equal({
                routes: routes
            });
        });
    });

    describe('rehydrate', function () {
        var newRoutes = {
            foo: {
                path: '/bar',
                method: 'get'
            }
        };
        it('should rehydrate the state correctly', function () {
            pluginInstance.rehydrate({
                routes: newRoutes
            });
            expect(pluginInstance.dehydrate()).to.deep.equal({
                routes: newRoutes
            });
        });
        it('should use rehydrated routes', function () {
            var a = new FluxibleApp();
            var p = routrPlugin();
            p.rehydrate({
                routes: newRoutes
            });
            a.plug(p);
            var c = a.createContext();
            expect(p.getRoutes()).to.deep.equal(newRoutes);
            expect(c.getActionContext().router.makePath('foo')).to.equal('/bar');
            expect(c.getComponentContext().makePath('foo')).to.equal('/bar');
        });
    });

});
