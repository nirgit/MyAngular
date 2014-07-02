/* jshint globaclstrict: true */
'use strict';

function initWatchValue() {};

function Scope() {
    this.$$watchers = [];
    this.$$asyncQueue = [];
};

Scope.prototype.$watch = function(watchFn, listenerFn, valueEq) {
    var watcher = {
        watchFn: watchFn,
        listenerFn: listenerFn || function() {},
        valueEq: !! valueEq,
        last: initWatchValue
    }
    this.$$watchers.push(watcher);
    this.$$lastDirtyWatch = null;
};

Scope.prototype.$digest = function() {
    var TTL = 10;
    var dirty = true;
    this.$$lastDirtyWatch = null;
    do {
        while (this.$$asyncQueue.length) {
            var asyncTask = this.$$asyncQueue.shift();
            asyncTask.scope.$eval(asyncTask.expression);
        }
        dirty = this.$$digestOnce();
        TTL--;
        if (dirty && !TTL) {
            throw "10 digest iterations reached.";
        }
    } while (dirty);
};

Scope.prototype.$$digestOnce = function() {
    var oldValue, newValue, dirty = false;
    for (var i = 0; i < this.$$watchers.length; i++) {
        var watcher = this.$$watchers[i];
        newValue = watcher.watchFn(this);
        oldValue = watcher.last;
        if (!this.$$areEqual(newValue, oldValue, watcher.valueEq)) {
            this.$$lastDirtyWatch = watcher;
            watcher.last = (watcher.valueEq ? _.cloneDeep(newValue) : newValue);
            watcher.listenerFn(newValue, oldValue === initWatchValue ? newValue : oldValue, this);
            dirty = true;
        } else if (this.$$lastDirtyWatch === watcher) {
            return false;
        }
    }
    return dirty;
};

Scope.prototype.$$areEqual = function(valueA, valueB, isValueEq) {
    if (isValueEq) {
        return _.isEqual(valueA, valueB);
    } else {
        return valueA === valueB ||
            (typeof valueA === 'number' && typeof valueB === 'number' &&
            isNaN(valueA) && isNaN(valueB));

    }
}

Scope.prototype.$eval = function(expression, args) {
    return expression(this, args);
}

Scope.prototype.$apply = function(expression) {
    try {
        return this.$eval(expression);
    } finally {
        this.$digest();
    }
}

Scope.prototype.$evalAsync = function(expr) {
    this.$$asyncQueue.push({
        scope: this,
        expression: expr
    });

}