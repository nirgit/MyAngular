/* jshint globaclstrict: true */
'use strict';

function initWatchValue() {};

function Scope() {
    this.$$watchers = [];
};

Scope.prototype.$watch = function(watchFn, listenerFn) {
    var watcher = {
        watchFn: watchFn,
        listenerFn: listenerFn || function() {},
        last: initWatchValue
    }
    this.$$watchers.push(watcher);
};

Scope.prototype.$digest = function() {
    var dirty = true;
    do {
        dirty = this.$$digestOnce();
    } while (dirty);
};

Scope.prototype.$$digestOnce = function() {
    var oldValue, newValue, dirty = false;
    for (var i = 0; i < this.$$watchers.length; i++) {
        var watcher = this.$$watchers[i];
        newValue = watcher.watchFn(this);
        oldValue = watcher.last;
        if (newValue !== oldValue) {
            watcher.last = newValue;
            watcher.listenerFn(newValue, oldValue === initWatchValue ? newValue : oldValue, this);
            dirty = true;
        }
    }
    return dirty;
};