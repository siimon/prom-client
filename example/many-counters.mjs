import promClient from '../index.js';

// Create a new Registry
const register = new promClient.Registry();

console.log('Creating 10,000 counters...\n');

const counters = [];

// Create 10,000 individual counters
for (let i = 0; i < 10000; i++) {
	const counter = new promClient.Counter({
		name: `counter_${i}`,
		help: `Counter number ${i}`,
		registers: [register],
	});
	counters.push(counter);
}

console.log('Populating counters with random data...\n');

// Increment each counter with random values
for (let i = 0; i < counters.length; i++) {
	const incrementCount = Math.floor(Math.random() * 100) + 1;
	counters[i].inc(incrementCount);
}

console.log('Generated data:');
console.log('- 10,000 counters created');
console.log('- Each counter incremented with random values (1-100)');
console.log('==========================================\n');

// Output the metrics
console.log(await register.metrics());
