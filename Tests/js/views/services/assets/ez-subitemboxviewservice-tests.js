/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-subitemboxviewservice-tests', function (Y) {
    var serviceTest,
        Assert = Y.Assert, Mock = Y.Mock;

    serviceTest = new Y.Test.Case({
        name: "eZ Subitem Box View Service tests",

        setUp: function () {
            this.content = {};
            this.contentType = {};
            this.location = {};
            this.searchResultList = [{content: this.content, contentType: this.contentType, location: this.location}];
            this.request = {
                params: {
                    searchString: this.searchString,
                    limit: this.limit
                }
            };
            this.app = new Y.Base();

            this.service = new Y.eZ.SubitemBoxViewService({
                request: this.request,
                app: this.app,
                response: {},
            });

            this.service.search = new Mock();
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
        },

        "Should get the view parameters": function () {
            var params,
                that = this;

            Mock.expect(this.service.search, {
                method: 'findContent',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: function (search, callback) {
                    callback(false, that.searchResultList);
                },
            });

            this.service.load(function(){});
            params = this.service.getViewParameters();

            Y.Assert.areSame(
                this.service.get('content'), params.content,
                'The content should be available in the return value of getViewParameters'
            );
            Y.Assert.areSame(
                this.service.get('contentType'), params.contentType,
                'The contentType should be available in the return value of getViewParameters'
            );
            Y.Assert.areSame(
                this.service.get('location'), params.location,
                'The location should be available in the return value of getViewParameters'
            );
        },
        
        "Should set the content, contentType and location": function () {
            var that = this;

            Mock.expect(this.service.search, {
                method: 'findContent',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: function (search, callback) {
                    callback(false, that.searchResultList);
                },
            });
            this.service.load(function(){});

            Assert.areSame(
                this.content,
                this.service.get('content'),
                "The content should be setted"
            );

            Assert.areSame(
                this.location,
                this.service.get('location'),
                "The location should be setted"
            );

            Assert.areSame(
                this.contentType,
                this.service.get('contentType'),
                "The contentType should be setted"
            );
        },

        "Should not set the content, contentType, location on search error ": function () {
            var that = this;

            Mock.expect(this.service.search, {
                method: 'findContent',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: function (search, callback) {
                    callback(true, that.searchResultList);
                },
            });
            this.service.load(function(){});

            Assert.isNull(

                this.service.get('content'),
                "The content should be setted"
            );

            Assert.isNull(

                this.service.get('location'),
                "The location should be setted"
            );

            Assert.isNull(
                this.service.get('contentType'),
                "The contentType should be setted"
            );
        },
    });

    Y.Test.Runner.setName("eZ Subitem Box  View Service tests");
    Y.Test.Runner.add(serviceTest);

}, '', {requires: ['test', 'ez-subitemboxviewservice', 'ez-searchplugin']});
