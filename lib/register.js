'use strict';
const Registry = require('./registry');

function isFunction(functionToCheck) {
	const getType = {};
	return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}
// Singleton instance to keep backwards compatibility
const _registry = new Registry();
const wrapper = {};

// Wrapper function to keep "this" context in Registry
const wrapFunction = function(fn){
	return function(){
		return fn.apply(this, arguments);
	};
};

for(const prop in _registry) {
	if(isFunction(_registry[prop])) {
		wrapper[prop] = wrapFunction.call(_registry, _registry[prop]);
	} else {
		wrapper[prop] = _registry[prop];
	}
}
module.exports = wrapper;
