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
