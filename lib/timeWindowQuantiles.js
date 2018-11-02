'use strict';

const { TDigest } = require('tdigest');

class TimeWindowQuantiles {
	constructor(maxAgeSeconds, ageBuckets) {
		this.maxAgeSeconds = maxAgeSeconds;
		this.ageBuckets = ageBuckets;

		this.ringBuffer = Array(ageBuckets).fill(new TDigest());
		this.currentBuffer = 0;

		this.lastRotateTimestampMillis = new Date().getTime();
		this.durationBetweenRotatesMillis = (maxAgeSeconds * 1000) / ageBuckets;
	}

	percentile(quantile) {
		const bucket = rotate.call(this);
		return bucket.percentile(quantile);
	}

	push(value) {
		rotate.call(this);
		this.ringBuffer.forEach(bucket => {
			bucket.push(value);
		});
	}

	reset() {
		this.ringBuffer.forEach(bucket => {
			bucket.reset();
		});
	}

	compress() {
		this.ringBuffer.forEach(bucket => {
			bucket.compress();
		});
	}
}

function rotate() {
	let timeSinceLastRotateMillis =
		new Date().getTime() - this.lastRotateTimestampMillis;
	while (timeSinceLastRotateMillis > this.durationBetweenRotatesMillis) {
		this.ringBuffer[this.currentBuffer] = new TDigest();

		if (++this.currentBuffer >= this.ringBuffer.length) {
			this.currentBuffer = 0;
		}
		timeSinceLastRotateMillis -= this.durationBetweenRotatesMillis;
		this.lastRotateTimestampMillis += this.durationBetweenRotatesMillis;
	}
	return this.ringBuffer[this.currentBuffer];
}

module.exports = TimeWindowQuantiles;
