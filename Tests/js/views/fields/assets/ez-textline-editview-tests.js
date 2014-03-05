YUI.add('ez-textline-editview-tests', function (Y) {
    var viewTest, registerTest, getFieldTest,
        container = Y.one('.container'),
        content, contentType, version,
        jsonContent = {}, jsonContentType = {}, jsonVersion = {},
        field = {};

    content = new Y.Mock();
    version = new Y.Mock();
    contentType = new Y.Mock();
    Y.Mock.expect(content, {
        method: 'toJSON',
        returns: jsonContent
    });
    Y.Mock.expect(version, {
        method: 'toJSON',
        returns: jsonVersion
    });
    Y.Mock.expect(contentType, {
        method: 'toJSON',
        returns: jsonContentType
    });

    viewTest = new Y.Test.Case({
        name: "eZ Text Line View test",

        _getFieldDefinition: function (required, minLength, maxLength) {
            return {
                isRequired: required,
                validatorConfiguration: {
                    StringLengthValidator: {
                        minStringLength: minLength,
                        maxStringLength: maxLength
                    }
                }
            };
        },

        setUp: function () {
            this.view = new Y.eZ.TextLineEditView({
                container: container,
                field: field,
                content: content,
                version: version,
                contentType: contentType
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        _testAvailableVariables: function (required, minLength, maxLength, expectRequired, expectMinLength, expectMinLengthPattern, expectMaxLength) {
            var fieldDefinition = this._getFieldDefinition(required, minLength, maxLength);

            this.view.set('fieldDefinition', fieldDefinition);

            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(9, Y.Object.keys(variables).length, "The template should receive 9 variables");

                Y.Assert.areSame(
                     jsonContent, variables.content,
                    "The content should be available in the field edit view template"
                );
                Y.Assert.areSame(
                     jsonVersion, variables.version,
                    "The version should be available in the field edit view template"
                );
                Y.Assert.areSame(
                    jsonContentType, variables.contentType,
                    "The contentType should be available in the field edit view template"
                );
                Y.Assert.areSame(
                    fieldDefinition, variables.fieldDefinition,
                    "The fieldDefinition should be available in the field edit view template"
                );
                Y.Assert.areSame(
                    field, variables.field,
                    "The field should be available in the field edit view template"
                );

                Y.Assert.areSame(expectRequired, variables.isRequired);
                Y.Assert.areSame(expectMinLength, variables.minLength);
                Y.Assert.areSame(expectMinLengthPattern, variables.minLengthPattern);
                Y.Assert.areSame(expectMaxLength, variables.maxLength);

                return '';
            };
            this.view.render();
        },

        "Test not required field no constraints": function () {
            this._testAvailableVariables(false, false, false, false, false, false, false);
        },

        "Test required field no constraints": function () {
            this._testAvailableVariables(true, false, false, true, false, false, false);
        },

        "Test not required field with min length constraint": function () {
            this._testAvailableVariables(false, 10, false, true, 10, '.{10,}', false);
        },

        "Test required field with constraints": function () {
            this._testAvailableVariables(true, 10, 50, true, 10, '.{10,}', 50);
        },

        "Test not required field with constraints": function () {
            this._testAvailableVariables(false, 10, 50, true, 10, '.{10,}', 50);
        },

        "Test validate no constraints": function () {
            var fieldDefinition = this._getFieldDefinition(false, false, false),
                input;

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            this.view.validate();
            Y.Assert.isTrue(
                this.view.isValid(),
                "An empty input is valid"
            );

            input = Y.one('.container input');
            input.set('value', 'foobar');
            Y.Assert.isTrue(
                this.view.isValid(),
                "A non empty input is valid"
            );
        },

        "Test validate required": function () {
            var fieldDefinition = this._getFieldDefinition(true, false, false),
                input;

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            input = Y.one('.container input');

            input.set('value', 'foobar');
            this.view.validate();
            Y.Assert.isTrue(
                this.view.isValid(),
                "A non empty input is valid"
            );

            input.set('value', '');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "An empty input is invalid"
            );
        },

        "Test validate min length": function () {
            var fieldDefinition = this._getFieldDefinition(false, 5, false),
                input;

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            input = Y.one('.container input');

            input.set('value', 'foobar');
            this.view.validate();
            Y.Assert.isTrue(
                this.view.isValid(),
                "'foobar' is valid"
            );

            input.set('value', 'foo');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "'foo' is invalid"
            );

            input.set('value', '');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "An empty string is invalid"
            );
        },

        "Test validate required && min length": function () {
            var fieldDefinition = this._getFieldDefinition(true, 5, false),
                input;

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            input = Y.one('.container input');

            input.set('value', 'foobar');
            this.view.validate();
            Y.Assert.isTrue(
                this.view.isValid(),
                "'foobar' is valid"
            );

            input.set('value', 'foo');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "'foo' is invalid"
            );

            input.set('value', '');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "An empty string is invalid"
            );
        }
    });

    Y.Test.Runner.setName("eZ Text Line Edit View tests");
    Y.Test.Runner.add(viewTest);

    getFieldTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.GetFieldTests, {
            fieldDefinition: {isRequired: false, validatorConfiguration: {StringLengthValidator: {}}},
            ViewConstructor: Y.eZ.TextLineEditView,
            newValue: 'Led Zeppelin',
        })
    );
    Y.Test.Runner.add(getFieldTest);

    registerTest = new Y.Test.Case(Y.eZ.EditViewRegisterTest);
    registerTest.name = "Text Line Edit View registration test";
    registerTest.viewType = Y.eZ.TextLineEditView;
    registerTest.viewKey = "ezstring";
    Y.Test.Runner.add(registerTest);
}, '0.0.1', {requires: ['test', 'getfield-tests', 'editviewregister-tests', 'ez-textline-editview']});
