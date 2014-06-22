/* jshint globalstrict: true */
/* global Scope: false */
'use strict';

describe("Scope test", function() {

    it("can be constructed and used as an object", function() {
        var scope = new Scope();
        scope.aProperty = 1;

        expect(scope.aProperty).toBe(1);
    });


    describe("digestOnce", function() {
        var scope;

        beforeEach(function() {
            scope = new Scope();
        });

        it("calls the listener function of a watch on first $$digestOnce", function() {
            var watchFn = function() {
                return 'wat';
            };
            var listenerFn = jasmine.createSpy();

            scope.$watch(watchFn, listenerFn);

            scope.$$digestOnce();

            expect(listenerFn).toHaveBeenCalled();
        });

        it("calls the watch function with a scope as an argument", function() {
            var watchFn = jasmine.createSpy();
            var listenerFn = function() {};

            scope.$watch(watchFn, listenerFn);
            scope.$$digestOnce();

            expect(watchFn).toHaveBeenCalledWith(scope);
        });

        it("calls the watch function when the watched value is changed", function() {
            scope.someValue = 'a';
            scope.counter = 0;

            scope.$watch(
                function(scope) {
                    return scope.someValue;
                },
                function(newValue, oldValue, scope) {
                    scope.counter++;
                }
            );

            expect(scope.counter).toBe(0);

            scope.$$digestOnce();
            expect(scope.counter).toBe(1);

            scope.$$digestOnce();
            expect(scope.counter).toBe(1);

            scope.someValue = 'b';
            expect(scope.counter).toBe(1);

            scope.$$digestOnce();
            expect(scope.counter).toBe(2);
        });

        it("calls the listener function when the watched value is first undefined", function() {
            var listenerFn = jasmine.createSpy();
            scope.counter = 0;

            scope.$watch(function(scope) {
                return scope.someValue;
            }, listenerFn);

            scope.$$digestOnce();

            expect(listenerFn).toHaveBeenCalled();
        });

        it("calls listener with new value as old value the first time", function() {
            scope.someValue = 123;
            var oldValueGiven;
            scope.$watch(
                function(scope) {
                    return scope.someValue;
                },
                function(newValue, oldValue, scope) {
                    oldValueGiven = oldValue;
                }
            );
            scope.$$digestOnce();
            expect(oldValueGiven).toBe(123);
        });

        it("may have watcher that dont have a listener function", function() {
            var watchFn = jasmine.createSpy();
            scope.$watch(watchFn);

            scope.$$digestOnce();

            expect(watchFn).toHaveBeenCalled();
        });

        it("triggers chained watchers in the same digestOnce", function() {
            scope.name = "Jane";

            scope.$watch(
                function(scope) {
                    return scope.nameUpper;
                },
                function(newValue, oldValue, scope) {
                    scope.initials = newValue && newValue.substr(0, 1) + ".";
                }
            );

            scope.$watch(
                function(scope) {
                    return scope.name;
                },
                function(newValue, oldValue, scope) {
                    scope.nameUpper = newValue[0].toUpperCase();
                }
            );

            scope.$digest();

            expect(scope.initials).toBe("J.");

            scope.name = "bob";
            scope.$digest();

            expect(scope.initials).toBe("B.");
        });
    });
});