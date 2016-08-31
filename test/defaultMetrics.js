'use strict';

describe('defaultMetrics', function() {
	var expect = require('chai').expect;
	var register = require('../index').register;
	var defaultMetrics = require('../index').defaultMetrics;
	var platform;
	var cpuUsage;
	var interval;

	before(function () {
		platform = process.platform;
		cpuUsage = process.cpuUsage;

		Object.defineProperty(process, 'platform', {
			value: 'my-bogus-platform'
		});

		if(cpuUsage) {
			Object.defineProperty(process, 'cpuUsage', {
				value: function () {
					return { user: 1000, system: 10 };
				}
			});
		} else {
			process.cpuUsage = function () {
				return { user: 1000, system: 10 };
			};
		}

		register.clear();
	});

	after(function () {
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
		expect(register.getMetricsAsJSON()).to.have.length(3);
	});

	it('should allow blacklisting unwanted metrics', function() {
		expect(register.getMetricsAsJSON()).to.have.length(0);
		interval = defaultMetrics(['osMemoryHeap']);
		expect(register.getMetricsAsJSON()).to.have.length(2);
	});
});
