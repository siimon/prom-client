'use strict';

describe('timeWindowQuantiles', () => {
	const TimeWindowQuantiles = require('../lib/timeWindowQuantiles');
	const lolex = require('lolex');
	let instance;
	let clock;

	beforeEach(() => {
		clock = lolex.install();
		instance = new TimeWindowQuantiles(5, 5);
	});

	describe('methods', () => {
		it('#push', () => {
			instance.push(1);
			instance.ringBuffer.forEach(td => {
				expect(td.centroids.size).toEqual(1);
			});
		});

		it('#reset', () => {
			instance.push(1);
			instance.reset();
			instance.ringBuffer.forEach(td => {
				expect(td.centroids.size).toEqual(0);
			});
		});

		it('#compress', () => {
			instance.push(1);
			instance.compress();
			instance.ringBuffer.forEach(td => {
				expect(td.centroids.size).toEqual(1);
			});
		});

		it('#percentile', () => {
			instance.push(1);
			expect(instance.percentile(0.5)).toEqual(1);
		});
	});

	describe('rotatation', () => {
		it('rotatation interval should be configured', () => {
			let localInstance = new TimeWindowQuantiles(1, 1);
			expect(localInstance.durationBetweenRotatesMillis).toEqual(1000);
			localInstance = new TimeWindowQuantiles(10, 5);
			expect(localInstance.durationBetweenRotatesMillis).toEqual(2000);
		});

		it('should rotate', () => {
			instance.push(1);
			expect(instance.currentBuffer).toEqual(0);
			clock.tick(1001);
			instance.percentile(0.5);
			expect(instance.currentBuffer).toEqual(1);
			clock.tick(1001);
			instance.percentile(0.5);
			expect(instance.currentBuffer).toEqual(2);
			clock.tick(1001);
			instance.percentile(0.5);
			expect(instance.currentBuffer).toEqual(3);
			clock.tick(1001);
			instance.percentile(0.5);
			expect(instance.currentBuffer).toEqual(4);
			clock.tick(1001);
			instance.percentile(0.5);
			expect(instance.currentBuffer).toEqual(0);

			instance.ringBuffer.forEach(td => {
				expect(td.centroids.size).toEqual(0);
			});
		});
	});
});
