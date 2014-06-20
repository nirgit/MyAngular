/* jshint globalstrict: true */
/* global Scope: false */
'use strict';

describe("Scope test", function() {

    it("can be constructed and used as an object", function() {
        var scope = new Scope();
        scope.aProperty = 1;

        expect(scope.aProperty).toBe(1);
    });


    describe("digest", function() {
        var scope;

        beforeEach(function() {
            scope = new Scope();
        });

        it("calls the listener function of a watch on first $digest", function() {
            var watchFn = function() {
                return 'wat';
            };
            var listenerFn = jasmine.createSpy();

            scope.$watch(watchFn, listenerFn);

            scope.$digest();

            expect(listenerFn).toHaveBeenCalled();
        });

        it("calls the watch function with a scope as an argument", function() {
            var watchFn = jasmine.createSpy();
            var listenerFn = function() {};

            scope.$watch(watchFn, listenerFn);
            scope.$digest();

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

            scope.$digest();
            expect(scope.counter).toBe(1);

            scope.$digest();
            expect(scope.counter).toBe(1);

            scope.someValue = 'b';
            expect(scope.counter).toBe(1);

            scope.$digest();
            expect(scope.counter).toBe(2);
        });

        it("calls the listener function when the watched value is first undefined", function() {
            var listenerFn = jasmine.createSpy();
            scope.counter = 0;

            scope.$watch(function(scope) {
                return scope.someValue;
            }, listenerFn);

            scope.$digest();

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
            scope.$digest();
            expect(oldValueGiven).toBe(123);
        });

    });
});