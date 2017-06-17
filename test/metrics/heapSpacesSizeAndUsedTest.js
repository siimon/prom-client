'use strict';

describe('heapSpacesSizeAndUsed', () => {
	let heapSpacesSizeAndUsed;
	const register = require('../../lib/register');
	const sinon = require('sinon');
	const expect = require('chai').expect;
	const mockery = require('mockery');

	beforeEach(() => {
		mockery.enable({
			warnOnReplace: false,
			warnOnUnregistered: false,
			useCleanCache: true
		});

		const v8Stub = {
			getHeapSpaceStatistics: sinon.stub().returns([
				{
					space_name: 'new_space',
					space_size: 100,
					space_used_size: 50,
					space_available_size: 500,
					physical_space_size: 100
				},
				{
					space_name: 'old_space',
					space_size: 100,
					space_used_size: 50,
					space_available_size: 500,
					physical_space_size: 100
				},
				{
					space_name: 'code_space',
					space_size: 100,
					space_used_size: 50,
					space_available_size: 500,
					physical_space_size: 100
				},
				{
					space_name: 'map_space',
					space_size: 100,
					space_used_size: 50,
					space_available_size: 500,
					physical_space_size: 100
				},
				{
					space_name: 'large_object_space',
					space_size: 100,
					space_used_size: 50,
					space_available_size: 500,
					physical_space_size: 100
				}
			])
		};
		mockery.registerMock('v8', v8Stub);

		heapSpacesSizeAndUsed = require('../../lib/metrics/heapSpacesSizeAndUsed');
	});

	afterEach(() => {
		mockery.disable();
		register.clear();
	});

	it('should set total heap spaces size gauges with from v8', () => {
		const expectedObj = {
			total: { new: 100, old: 100, code: 100, map: 100, large_object: 100 },
			used: { new: 50, old: 50, code: 50, map: 50, large_object: 50 },
			available: { new: 500, old: 500, code: 500, map: 500, large_object: 500 }
		};

		expect(heapSpacesSizeAndUsed()()).to.deep.equal(expectedObj);
	});
});
