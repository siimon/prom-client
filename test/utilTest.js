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
			}).toThrowError(
				'Invalid number of arguments: "arg1" for label names: "label1,label2".',
			);
		});
	});
});
