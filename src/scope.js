/* jshint globaclstrict: true */
'use strict';

function Scope() {
    this.$$watchers = [];
}

Scope.prototype.$watch = function(watchFn, listenerFn) {
    var watcher = {
        watchFn: watchFn,
        listenerFn: listenerFn,
        last: undefined
    }
    this.$$watchers.push(watcher);
};

Scope.prototype.$digest = function() {
    var oldValue, newValue;
    for (var i = 0; i < this.$$watchers.length; i++) {
        var watcher = this.$$watchers[i];
        newValue = watcher.watchFn(this);
        oldValue = watcher.last;
        if (newValue !== oldValue) {
            watcher.listenerFn(newValue, oldValue, this);
            watcher.last = newValue;
        }
    }
};