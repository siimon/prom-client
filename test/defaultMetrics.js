'use strict';

describe('defaultMetrics', function() {
	var expect = require('chai').expect;
	var register = require('../index').register;
	var defaultMetrics = require('../index').defaultMetrics;
	var platform;
	var cpuUsage;
	var interval;

	before(function() {
		platform = process.platform;
		cpuUsage = process.cpuUsage;

		Object.defineProperty(process, 'platform', {
			value: 'my-bogus-platform'
		});

		if(cpuUsage) {
			Object.defineProperty(process, 'cpuUsage', {
				value: function() {
					return { user: 1000, system: 10 };
				}
			});
		} else {
			process.cpuUsage = function() {
				return { user: 1000, system: 10 };
			};
		}

		register.clear();
	});

	after(function() {
		Object.defineProperty(process, 'platform', {
			value: platform
		});

		if(cpuUsage) {
			Object.defineProperty(process, 'cpuUsage', {
				value: cpuUsage
			});
		} else {
			delete process.cpuUsage;
		}
	});

	afterEach(function() {
		register.clear();
		clearInterval(interval);
	});

	it('should add metrics to the registry', function() {
		expect(register.getMetricsAsJSON()).to.have.length(0);
		interval = defaultMetrics();
		expect(register.getMetricsAsJSON()).to.have.length(9);
	});

	it('should allow blacklisting unwanted metrics', function() {
		expect(register.getMetricsAsJSON()).to.have.length(0);
		interval = defaultMetrics(['osMemoryHeap']);
		expect(register.getMetricsAsJSON()).to.have.length(8);
	});

	it('should allow blacklisting all metrics', function() {
		expect(register.getMetricsAsJSON()).to.have.length(0);
		clearInterval(defaultMetrics());
		register.clear();
		expect(register.getMetricsAsJSON()).to.have.length(0);
	});


	describe('disabling', function() {
		it('should not throw error', function() {
			var fn = function() {
				delete require.cache[require.resolve('../index')];
				var client = require('../index');
				clearInterval(client.defaultMetrics());
				register.clear();
			};

			expect(fn).to.not.throw(Error);
		});
	});

});
