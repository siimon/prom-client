'use strict';

describe('histogram', () => {
	const Histogram = require('../index').Histogram;
	const Registry = require('../index').Registry;
	const globalRegistry = require('../index').register;
	let instance;

	afterEach(() => {
		instance = null;
		globalRegistry.clear();
	});

	describe('with object as params', () => {
		describe('with global registry', () => {
			beforeEach(() => {
				instance = new Histogram({ name: 'test_histogram', help: 'test' });
			});

			it('should increase count', async () => {
				instance.observe(0.5);
				const valuePair = getValueByName(
					'test_histogram_count',
					(await instance.get()).values,
				);
				expect(valuePair.value).toEqual(1);
			});
			it('should be able to observe 0s', async () => {
				instance.observe(0);
				const valuePair = getValueByLabel(0.005, (await instance.get()).values);
				expect(valuePair.value).toEqual(1);
			});
			it('should increase sum', async () => {
				instance.observe(0.5);
				const valuePair = getValueByName(
					'test_histogram_sum',
					(await instance.get()).values,
				);
				expect(valuePair.value).toEqual(0.5);
			});
			it('should add item in upper bound bucket', async () => {
				instance.observe(1);
				const valuePair = getValueByLabel(1, (await instance.get()).values);
				expect(valuePair.value).toEqual(1);
			});

			it('should be able to monitor more than one item', async () => {
				instance.observe(0.05);
				instance.observe(5);
				const firstValuePair = getValueByLabel(
					0.05,
					(await instance.get()).values,
				);
				const secondValuePair = getValueByLabel(
					5,
					(await instance.get()).values,
				);
				expect(firstValuePair.value).toEqual(1);
				expect(secondValuePair.value).toEqual(2);
			});

			it('should add a +Inf bucket with the same value as count', async () => {
				instance.observe(10);
				const countValuePair = getValueByName(
					'test_histogram_count',
					(await instance.get()).values,
				);
				const infValuePair = getValueByLabel(
					'+Inf',
					(await instance.get()).values,
				);
				expect(infValuePair.value).toEqual(countValuePair.value);
			});

			it('should add buckets in increasing numerical order', async () => {
				const histogram = new Histogram({
					name: 'test_histogram_2',
					help: 'test',
					buckets: [1, 5],
				});
				histogram.observe(1.5);
				const values = (await histogram.get()).values;
				expect(values[0].labels.le).toEqual(1);
				expect(values[1].labels.le).toEqual(5);
				expect(values[2].labels.le).toEqual('+Inf');
			});
			it('should group counts on each label set', async () => {
				const histogram = new Histogram({
					name: 'test_histogram_2',
					help: 'test',
					labelNames: ['code'],
				});
				histogram.observe({ code: '200' }, 1);
				histogram.observe({ code: '300' }, 1);
				const values = getValuesByLabel(1, (await histogram.get()).values);
				expect(values[0].value).toEqual(1);
				expect(values[1].value).toEqual(1);
			});

			it('should time requests', async () => {
				jest.useFakeTimers('modern');
				jest.setSystemTime(0);
				const doneFn = instance.startTimer();
				jest.advanceTimersByTime(500);
				doneFn();
				const valuePair = getValueByLabel(0.5, (await instance.get()).values);
				expect(valuePair.value).toEqual(1);
				jest.useRealTimers();
			});

			it('should time requests, end function should return time spent value', () => {
				jest.useFakeTimers('modern');
				jest.setSystemTime(0);
				const doneFn = instance.startTimer();
				jest.advanceTimersByTime(500);
				const value = doneFn();
				expect(value).toEqual(0.5);
				jest.useRealTimers();
			});

			it('should not allow non numbers', () => {
				const fn = function () {
					instance.observe('asd');
				};
				expect(fn).toThrowErrorMatchingSnapshot();
			});

			it('should allow custom labels', async () => {
				const i = new Histogram({
					name: 'histo',
					help: 'help',
					labelNames: ['code'],
				});
				i.observe({ code: 'test' }, 1);
				const pair = getValueByLeAndLabel(
					1,
					'code',
					'test',
					(await i.get()).values,
				);
				expect(pair.value).toEqual(1);
			});

			it('should not allow le as a custom label', () => {
				const fn = function () {
					new Histogram({ name: 'name', help: 'help', labelNames: ['le'] });
				};
				expect(fn).toThrowErrorMatchingSnapshot();
			});

			it('should observe value if outside most upper bound', async () => {
				instance.observe(100000);
				const values = (await instance.get()).values;
				const count = getValueByLabel('+Inf', values, 'le');
				expect(count.value).toEqual(1);
			});

			it('should allow to be reset itself', async () => {
				instance.observe(0.5);
				let valuePair = getValueByName(
					'test_histogram_count',
					(await instance.get()).values,
				);
				expect(valuePair.value).toEqual(1);
				instance.reset();
				valuePair = getValueByName(
					'test_histogram_count',
					(await instance.get()).values,
				);
				expect(valuePair.value).toEqual(undefined);
			});

			it('should init to 0', async () => {
				(await instance.get()).values.forEach(bucket => {
					expect(bucket.value).toEqual(0);
				});
			});

			describe('labels', () => {
				beforeEach(() => {
					instance = new Histogram({
						name: 'histogram_labels',
						help: 'Histogram with labels fn',
						labelNames: ['method'],
					});
				});

				it('should observe', async () => {
					instance.labels('get').observe(4);
					const res = getValueByLeAndLabel(
						5,
						'method',
						'get',
						(await instance.get()).values,
					);
					expect(res.value).toEqual(1);
				});

				it('should not allow different number of labels', () => {
					const fn = function () {
						instance.labels('get', '500').observe(4);
					};
					expect(fn).toThrowErrorMatchingSnapshot();
				});

				it('should start a timer', async () => {
					jest.useFakeTimers('modern');
					jest.setSystemTime(0);
					const end = instance.labels('get').startTimer();
					jest.advanceTimersByTime(500);
					end();
					const res = getValueByLeAndLabel(
						0.5,
						'method',
						'get',
						(await instance.get()).values,
					);
					expect(res.value).toEqual(1);
					jest.useRealTimers();
				});

				it('should start a timer and set labels afterwards', async () => {
					jest.useFakeTimers('modern');
					jest.setSystemTime(0);
					const end = instance.startTimer();
					jest.advanceTimersByTime(500);
					end({ method: 'get' });
					const res = getValueByLeAndLabel(
						0.5,
						'method',
						'get',
						(await instance.get()).values,
					);
					expect(res.value).toEqual(1);
					jest.useRealTimers();
				});

				it('should allow labels before and after timers', async () => {
					instance = new Histogram({
						name: 'histogram_labels_2',
						help: 'Histogram with labels fn',
						labelNames: ['method', 'success'],
					});
					jest.useFakeTimers('modern');
					jest.setSystemTime(0);
					const end = instance.startTimer({ method: 'get' });
					jest.advanceTimersByTime(500);
					end({ success: 'SUCCESS' });
					const res1 = getValueByLeAndLabel(
						0.5,
						'method',
						'get',
						(await instance.get()).values,
					);
					const res2 = getValueByLeAndLabel(
						0.5,
						'success',
						'SUCCESS',
						(await instance.get()).values,
					);
					expect(res1.value).toEqual(1);
					expect(res2.value).toEqual(1);
					jest.useRealTimers();
				});

				it('should not mutate passed startLabels', () => {
					const startLabels = { method: 'GET' };
					const end = instance.startTimer(startLabels);
					end({ method: 'POST' });
					expect(startLabels).toEqual({ method: 'GET' });
				});
			});

			describe('remove', () => {
				beforeEach(() => {
					instance = new Histogram({
						name: 'histogram_labels',
						help: 'Histogram with labels fn',
						labelNames: ['method'],
					});
				});

				it('should remove matching label', async () => {
					instance.labels('POST').observe(3);
					instance.labels('GET').observe(4);
					instance.remove('POST');

					const res = getValueByLeAndLabel(
						5,
						'method',
						'GET',
						(await instance.get()).values,
					);
					expect(res.value).toEqual(1);
				});

				it('should remove all labels', async () => {
					instance.labels('POST').observe(3);
					instance.labels('GET').observe(4);
					instance.remove('POST');
					instance.remove('GET');

					expect((await instance.get()).values).toHaveLength(0);
				});

				it('should throw error if label lengths does not match', () => {
					const fn = function () {
						instance.remove('GET', '/foo');
					};
					expect(fn).toThrowErrorMatchingSnapshot();
				});

				it('should remove timer labels', async () => {
					jest.useFakeTimers('modern');
					jest.setSystemTime(0);
					const getEnd = instance.labels('GET').startTimer();
					const postEnd = instance.labels('POST').startTimer();
					jest.advanceTimersByTime(500);
					postEnd();
					getEnd();
					instance.remove('POST');
					const res = getValueByLeAndLabel(
						0.5,
						'method',
						'GET',
						(await instance.get()).values,
					);
					expect(res.value).toEqual(1);
					jest.useRealTimers();
				});

				it('should remove timer labels when labels are set afterwards', async () => {
					jest.useFakeTimers('modern');
					jest.setSystemTime(0);
					const end = instance.startTimer();
					jest.advanceTimersByTime(500);
					end({ method: 'GET' });
					instance.remove('GET');
					expect((await instance.get()).values).toHaveLength(0);
					jest.useRealTimers();
				});

				it('should remove labels before and after timers', async () => {
					instance = new Histogram({
						name: 'histogram_labels_2',
						help: 'Histogram with labels fn',
						labelNames: ['method', 'success'],
					});
					jest.useFakeTimers('modern');
					jest.setSystemTime(0);
					const end = instance.startTimer({ method: 'GET' });
					jest.advanceTimersByTime(500);
					end({ success: 'SUCCESS' });
					instance.remove('GET', 'SUCCESS');
					expect((await instance.get()).values).toHaveLength(0);
					jest.useRealTimers();
				});
			});
		});

		describe('without registry', () => {
			beforeEach(() => {
				instance = new Histogram({
					name: 'test_histogram',
					help: 'test',
					registers: [],
				});
			});
			it('should increase count', async () => {
				instance.observe(0.5);
				const valuePair = getValueByName(
					'test_histogram_count',
					(await instance.get()).values,
				);
				expect(valuePair.value).toEqual(1);
				expect((await globalRegistry.getMetricsAsJSON()).length).toEqual(0);
			});
		});
		describe('registry instance', () => {
			let registryInstance;
			beforeEach(() => {
				registryInstance = new Registry();
				instance = new Histogram({
					name: 'test_histogram',
					help: 'test',
					registers: [registryInstance],
				});
			});
			it('should increment counter', async () => {
				instance.observe(0.5);
				const valuePair = getValueByName(
					'test_histogram_count',
					(await instance.get()).values,
				);
				expect(valuePair.value).toEqual(1);
				expect((await globalRegistry.getMetricsAsJSON()).length).toEqual(0);
				expect((await registryInstance.getMetricsAsJSON()).length).toEqual(1);
			});
		});
	});
	function getValueByName(name, values) {
		return (
			values.length > 0 &&
			values.reduce((acc, val) => {
				if (val.metricName === name) {
					acc = val;
				}
				return acc;
			})
		);
	}
	function getValueByLeAndLabel(le, key, label, values) {
		return values.reduce((acc, val) => {
			if (val.labels && val.labels.le === le && val.labels[key] === label) {
				acc = val;
			}
			return acc;
		}, {});
	}
	function getValueByLabel(label, values, key) {
		return values.reduce((acc, val) => {
			if (val.labels && val.labels[key || 'le'] === label) {
				acc = val;
			}
			return acc;
		}, {});
	}
	function getValuesByLabel(label, values, key) {
		return values.reduce((acc, val) => {
			if (val.labels && val.labels[key || 'le'] === label) {
				acc.push(val);
			}
			return acc;
		}, []);
	}
});
