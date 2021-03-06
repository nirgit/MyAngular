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

        it("gives up on the watches after 10 unstable attempts", function() {
            scope.number = 1;

            scope.$watch(
                function(scope) {
                    return scope.number;
                },
                function(newValue, oldValue, scope) {
                    scope.number += 2;
                }
            );

            scope.$watch(
                function(scope) {
                    return scope.number;
                },
                function(newValue, oldValue, scope) {
                    scope.number += 3;
                }
            );

            expect((function() {
                scope.$digest();
            })).toThrow();

        });

        it("ends the digest when the last watch is clean", function() {
            scope.array = _.range(100);
            var watchExecutions = 0;
            _.times(100, function(i) {
                scope.$watch(
                    function(scope) {
                        watchExecutions++;
                        return scope.array[i];
                    },
                    function(newValue, oldValue, scope) {}
                );
            });
            scope.$digest();
            expect(watchExecutions).toBe(200);

            scope.array[0] = 420;
            scope.$digest();
            expect(watchExecutions).toBe(301);
        });

        it("does not end digest so that new watches are not run", function() {
            scope.aValue = 'abc';
            scope.counter = 0;
            scope.$watch(
                function(scope) {
                    return scope.aValue;
                },
                function(newValue, oldValue, scope) {
                    scope.$watch(
                        function(scope) {
                            return scope.aValue;
                        },
                        function(newValue, oldValue, scope) {
                            scope.counter++;
                        }
                    );
                }
            );
            scope.$digest();
            expect(scope.counter).toBe(1);
        });

        it("compares based on value if enabled", function() {
            scope.aValue = [1, 2, 3];
            scope.counter = 0;
            scope.$watch(
                function(scope) {
                    return scope.aValue;
                },
                function(newValue, oldValue, scope) {
                    scope.counter++;
                },
                true
            );
            scope.$digest();
            expect(scope.counter).toBe(1);
            scope.aValue.push(4);
            scope.$digest();
            expect(scope.counter).toBe(2);
        });

        it("should handle NaN correctly.", function() {
            scope.counter = 0;
            scope.value = 0 / 0; // This is NaN

            scope.$watch(
                function(scope) {
                    return scope.value;
                },
                function(newValue, oldValue, scope) {
                    scope.counter++;
                }
            );

            scope.$digest();
            expect(scope.counter).toBe(1);

            scope.$digest();
            expect(scope.counter).toBe(1);
        });

        it("executes $eval'ed function and returns result", function() {
            scope.value = 42;

            var result = scope.$eval(function(scope) {
                return scope.value;
            });

            expect(result).toBe(42);
        });

        it("passes the second $eval arg straight through", function() {
            scope.value = 42;

            var result = scope.$eval(function(scope, arg) {
                return scope.value + arg;
            }, 2);

            expect(result).toBe(44);
        });

        it("executes $apply'ed function and starts the digest", function() {
            scope.aValue = 'someValue';
            scope.counter = 0;
            scope.$watch(
                function(scope) {
                    return scope.aValue;
                },
                function(newValue, oldValue, scope) {
                    scope.counter++;
                }
            );
            scope.$digest();
            expect(scope.counter).toBe(1);

            scope.$apply(function(scope) {
                scope.aValue = 'someOtherValue';
            });
            expect(scope.counter).toBe(2);
        });

        it("executes $evalAsynced function later in the same cycle", function() {
            scope.aValue = [1, 2, 3];
            scope.asyncEvaluated = false;
            scope.asyncEvaluatedImmediately = false;
            scope.$watch(
                function(scope) {
                    return scope.aValue;
                },
                function(newValue, oldValue, scope) {
                    scope.$evalAsync(function(scope) {
                        scope.asyncEvaluated = true;
                    });
                    scope.asyncEvaluatedImmediately = scope.asyncEvaluated;
                }
            );
            scope.$digest();
            expect(scope.asyncEvaluated).toBe(true);
            expect(scope.asyncEvaluatedImmediately).toBe(false);
        });

        it("executes $evalAsynced functions even when not dirty", function() {
            scope.aValue = [1, 2, 3];
            scope.asyncEvaluatedTimes = 0;
            scope.$watch(
                function(scope) {
                    if (scope.asyncEvaluatedTimes < 2) {
                        scope.$evalAsync(function(scope) {
                            scope.asyncEvaluatedTimes++;
                        });
                    }
                    return scope.aValue;
                },
                function(newValue, oldValue, scope) {}
            );
            scope.$digest();
            expect(scope.asyncEvaluatedTimes).toBe(2);
        });

        it("has a $$phase field which describes the current $digest phase", function() {
            scope.aValue = [1, 2, 3];
            scope.phaseInWatchFunction = undefined;
            scope.phaseInListenerFunction = undefined;
            scope.phaseInApplyFunction = undefined;

            scope.$watch(
                function(scope) {
                    scope.phaseInWatchFunction = scope.$$phase;
                    return scope.aValue;
                },
                function(newValue, oldValue, scope) {
                    scope.phaseInListenerFunction = scope.$$phase;
                });

            scope.$apply(function(scope) {
                scope.phaseInApplyFunction = scope.$$phase;
            });

            expect(scope.phaseInWatchFunction).toBe("$digest");
            expect(scope.phaseInListenerFunction).toBe("$digest");
            expect(scope.phaseInApplyFunction).toBe("$apply");
        });

        it("schedules a digest in $evalAsync", function(done) {
            scope.aValue = "abc";
            scope.counter = 0;

            scope.$watch(function(scope) {
                    return scope.aValue;
                },
                function(newValue, oldValue, scope) {
                    scope.counter++;
                });

            scope.$evalAsync(function(scope) {});

            expect(scope.counter).toBe(0);
            setTimeout(function() {
                expect(scope.counter).toBe(1);
                done();
            }, 50);
        });

        it("runs a $$postDigest function after every $digest cycle", function() {
            scope.counter = 0;

            scope.$$postDigest(function() {
                scope.counter++;
            });

            expect(scope.counter).toBe(0);

            scope.$digest();
            expect(scope.counter).toBe(1);

            scope.$digest();
            expect(scope.counter).toBe(1);
        });

        it("does not include $$postDigest in the digest", function() {
            scope.aValue = 'original value';

            scope.$$postDigest(function() {
                scope.aValue = 'changed value';
            });

            scope.$watch(
                function(scope) {
                    return scope.aValue;
                },
                function(newValue, oldValue, scope) {
                    scope.watchedValue = newValue;
                });

            scope.$digest();
            expect(scope.watchedValue).toBe('original value');

            scope.$digest();
            expect(scope.watchedValue).toBe('changed value');
        });

        it("catches exceptions thrown in watch functions and continues", function() {
            scope.counter = 0;

            scope.$watch(
                function(scope) {
                    throw "error on watcher!";
                },
                function(newValue, oldValue, scope) {
                    scope.counter++;
                }
            );
            scope.$digest();
            expect(scope.counter).toBe(0);

            scope.$watch(
                function(scope) {
                    return scope.aValue;
                },
                function(newValue, oldValue, scope) {
                    scope.counter++;
                }
            );
            scope.$digest();
            expect(scope.counter).toBe(1);
        });

        it("catches exceptions in listener functions and continues", function() {
            scope.aValue = 'abc';
            scope.counter = 0;
            scope.$watch(
                function(scope) {
                    return scope.aValue;
                },
                function(newValue, oldValue, scope) {
                    throw "Error";
                }
            );
            scope.$watch(
                function(scope) {
                    return scope.aValue;
                },
                function(newValue, oldValue, scope) {
                    scope.counter++;
                }
            );
            scope.$digest();
            expect(scope.counter).toBe(1);
        });

    });
});