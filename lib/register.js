'use strict';
var Registry = require('./registry');

function isFunction(functionToCheck) {
	var getType = {};
	return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}
// Singleton instance to keep backwards compatibility
var _registry = new Registry();
var wrapper = {};

// Wrapper function to keep "this" context in Registry
var wrapFunction = function(fn){
	return function(){
		return fn.apply(this, arguments);
	};
};

for(var prop in _registry) {
	if(isFunction(_registry[prop])) {
		wrapper[prop] = wrapFunction.call(_registry, _registry[prop]);
	} else {
		wrapper[prop] = _registry[prop];
	}
}
module.exports = wrapper;
