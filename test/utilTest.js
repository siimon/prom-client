'use strict';

describe('utils', () => {
	describe('getLabels', () => {
		const getLabels = require('../lib/util').getLabels;

		it('should not throw on missing argument', async () => {
			const labels = getLabels(['label1', 'label2'], ['arg1', 'arg2']);
			expect(labels).toEqual({ label1: 'arg1', label2: 'arg2' });
		});

		it('should throw on missing argument', async () => {
			expect(() => {
				getLabels(['label1', 'label2'], ['arg1']);
			}).toThrow(
				'Invalid number of arguments (1): "arg1" for label names (2): "label1, label2".',
			);
		});
	});

	describe('LabelMap', () => {
		const { LabelMap } = require('../lib/util');

		it('can be instantiated', () => {
			const map = new LabelMap(['d', 'b', 'a']);

			expect(map.size).toEqual(0);
		});

		describe('keyFrom()', () => {
			it('handles reordered labels', () => {
				const map = new LabelMap(['b', 'c', 'a']);

				const result = map.keyFrom({ a: 1, c: 200, b: 'post' });

				expect(result).toEqual('1|post|200');
			});

			it('allows sparse labels ', () => {
				const map = new LabelMap(['b', 'c', 'a', 'd']);

				const result = map.keyFrom({ d: 'a|b' });

				expect(result).toEqual('|||a|b');
			});
		});

		describe('set()', () => {
			it('can create new records', () => {
				const map = new LabelMap(['b', 'c', 'a']);

				map.set({ a: 2 }, 3);

				expect(map.size).toEqual(1);
				expect(map.get('2||')).toStrictEqual({ value: 3, labels: { a: 2 } });
			});

			it('can update existing values', () => {
				const map = new LabelMap(['b', 'c', 'a']);

				// And supports chaining
				map.set({ a: 2 }, 3).set({ a: 2 }, 4);

				expect(map.size).toEqual(1);
				expect(map.get('2||')).toStrictEqual({ value: 4, labels: { a: 2 } });
			});

			it('creates separate records for each label combination', () => {
				const map = new LabelMap(['b', 'c', 'a']);

				map.set({ a: 2 }, 3).set({ a: 3 }, 3);

				expect(map.size).toEqual(2);
				expect(map.get('2||')).toStrictEqual({ value: 3, labels: { a: 2 } });
			});
		});

		describe('setDetla()', () => {
			it('can create new records', () => {
				const map = new LabelMap(['b', 'c', 'a']);

				map.setDelta({ a: 2 }, 3);

				expect(map.size).toEqual(1);
				expect(map.get('2||')).toStrictEqual({ value: 3, labels: { a: 2 } });
			});

			it('can update existing values', () => {
				const map = new LabelMap(['b', 'c', 'a']);

				map.setDelta({ a: 2 }, 3).setDelta({ a: 2 }, 4);

				expect(map.size).toEqual(1);
				expect(map.get('2||')).toStrictEqual({
					value: 3 + 4,
					labels: { a: 2 },
				});
			});

			it('creates separate records for each label combination', () => {
				const map = new LabelMap(['b', 'c', 'a']);

				map.setDelta({ a: 2 }, 3);
				map.setDelta({ a: 3 }, 3);

				expect(map.size).toEqual(2);
				expect(map.get('2||')).toStrictEqual({ value: 3, labels: { a: 2 } });
			});
		});

		describe('remove()', () => {
			it('can create new records', () => {
				const map = new LabelMap(['b', 'c', 'a']);

				map.setDelta({ a: 2 }, 3);

				expect(map.size).toEqual(1);
				expect(map.get('2||')).toStrictEqual({ value: 3, labels: { a: 2 } });
			});

			it('can update existing values', () => {
				const map = new LabelMap(['b', 'c', 'a']);

				map.setDelta({ a: 2 }, 3).setDelta({ a: 2 }, 4);

				expect(map.size).toEqual(1);
				expect(map.get('2||')).toStrictEqual({
					value: 3 + 4,
					labels: { a: 2 },
				});
			});

			it('creates separate records for each label combination', () => {
				const map = new LabelMap(['b', 'c', 'a']);

				map.setDelta({ a: 2 }, 3);
				map.setDelta({ a: 3 }, 3);

				expect(map.size).toEqual(2);
				expect(map.get('2||')).toStrictEqual({ value: 3, labels: { a: 2 } });
			});
		});

		describe('getOrAdd()', () => {
			it('returns existing values', () => {
				const map = new LabelMap(['b', 'c', 'a']);
				const callback = jest.fn();

				map.set({ c: 200 }, [2, 3]);

				const actual = map.getOrAdd({ c: 200 }, callback);

				expect(actual).toStrictEqual([2, 3]);
				expect(callback).not.toHaveBeenCalled();
			});

			it('adds on missing record', () => {
				const map = new LabelMap(['b', 'c', 'a']);
				const callback = jest.fn(() => 4);

				map.set({ c: 200 }, [2, 3]);

				const actual = map.getOrAdd({ c: 401 }, callback);

				expect(actual).toStrictEqual(4);
				expect(map.get('||401')).toStrictEqual({
					labels: { c: 401 },
					value: 4,
				});
				expect(callback).toHaveBeenCalled();
			});
		});

		describe('clear()', () => {
			it('resets the collection', () => {
				const map = new LabelMap(['b', 'c', 'a']);

				map.set({ a: 2 }, 3).set({ a: 3 }, 4);
				map.clear();

				expect(map.size).toEqual(0);
			});

			it('can still add new records after clear()ing', () => {
				const map = new LabelMap(['b', 'c', 'a']);

				map.set({ a: 2 }, 3);
				map.clear();
				map.set({ a: 3 }, 4);

				expect(map.size).toEqual(1);
				expect(map.get('3||')).toStrictEqual({ value: 4, labels: { a: 3 } });
			});
		});
	});

	describe('Grouper', () => {
		const { Grouper } = require('../lib/util');

		it('can be instantiated', () => {
			const grouper = new Grouper();

			expect(grouper.size).toEqual(0);
		});

		it('supports same constructor syntax as Map', () => {
			const grouper = new Grouper([['name', []]]);

			expect(grouper.size).toEqual(1);
			expect(grouper.has('name')).toBe(true);
		});

		describe('add()', () => {
			it('can create new records', () => {
				const grouper = new Grouper([['name', [2]]]);

				grouper.add('name', 3);

				expect(grouper.size).toEqual(1);
				expect(grouper.get('name')).toStrictEqual([2, 3]);
			});

			it('creates separate records for each key', () => {
				const grouper = new Grouper([['name', [2]]]);

				grouper.add('other', 3);

				expect(grouper.size).toEqual(2);
				expect(grouper.get('other')).toStrictEqual([3]);
			});
		});

		describe('getOrAdd()', () => {
			it('returns existing values', () => {
				const grouper = new Grouper([['name', [2, 3]]]);
				const callback = jest.fn();

				const actual = grouper.getOrAdd('name', callback);

				expect(actual).toStrictEqual([2, 3]);
				expect(callback).not.toHaveBeenCalled();
			});

			it('adds on missing record', () => {
				const grouper = new Grouper([['name', [2, 3]]]);
				const callback = jest.fn(() => 4);

				const actual = grouper.getOrAdd('blah', callback);

				expect(actual).toStrictEqual(4);
				expect(grouper.get('blah')).toStrictEqual(4);
				expect(callback).toHaveBeenCalled();
			});

			it('defaults to inserting an empty array', () => {
				const grouper = new Grouper([['name', [2, 3]]]);
				const actual = grouper.getOrAdd('blah');

				expect(actual).toStrictEqual([]);
				expect(grouper.get('blah')).toStrictEqual([]);
			});
		});
	});
});
