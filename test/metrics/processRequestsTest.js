'use strict';

describe('processRequests', function () {
    var expect = require('chai').expect;
    var register = require('../../index').register;
    var processRequests = require('../../lib/metrics/processRequests');

    before(function () {
        register.clear();
    });

    afterEach(function () {
        register.clear();
    });

    it('should add metric to the registry', function () {
        expect(register.getMetricsAsJSON()).to.have.length(0);

        processRequests()();

        var metrics = register.getMetricsAsJSON();

        expect(metrics).to.have.length(1);
        expect(metrics[0].help).to.equal('Number of active requests.');
        expect(metrics[0].type).to.equal('gauge');
        expect(metrics[0].name).to.equal('node_active_requests_total');
    });
});
