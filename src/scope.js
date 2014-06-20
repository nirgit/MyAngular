/* jshint globaclstrict: true */
'use strict';

function Scope() {
    this.$$watchers = [];
}

Scope.prototype.$watch = function(watchFn, listenerFn) {
    var watcher = {
        watchFn: watchFn,
        listenerFn: listenerFn
    }
    this.$$watchers.push(watcher);
};

Scope.prototype.$digest = function() {
    for (var i = 0; i < this.$$watchers.length; i++) {
        this.$$watchers[i].listenerFn();
    }
};