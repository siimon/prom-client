'use strict';

const promClient = require('../index');

// Create a new Registry
const register = new promClient.Registry();

// Create Summary metrics with percentiles
const apiLatency = new promClient.Summary({
	name: 'api_request_duration_seconds',
	help: 'API request duration in seconds',
	labelNames: ['endpoint', 'method'],
	percentiles: [0.5, 0.75, 0.9, 0.95, 0.99],
	registers: [register],
});

const databaseQueryDuration = new promClient.Summary({
	name: 'database_query_duration_seconds',
	help: 'Database query duration in seconds',
	labelNames: ['query_type', 'table'],
	percentiles: [0.5, 0.9, 0.99],
	registers: [register],
});

const payloadSize = new promClient.Summary({
	name: 'request_payload_size_bytes',
	help: 'Size of request payloads in bytes',
	labelNames: ['content_type'],
	percentiles: [0.5, 0.75, 0.9, 0.95, 0.99],
	registers: [register],
});

// Simulation data
const endpoints = ['/api/users', '/api/products', '/api/orders', '/api/search'];
const methods = ['GET', 'POST', 'PUT', 'DELETE'];
const queryTypes = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'];
const tables = ['users', 'products', 'orders', 'sessions'];
const contentTypes = [
	'application/json',
	'multipart/form-data',
	'application/xml',
];

// Function to generate realistic latencies (log-normal distribution approximation)
function getRandomLatency(baseMs, varianceMs) {
	// Using Box-Muller transform for normal distribution
	const u1 = Math.random();
	const u2 = Math.random();
	const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
	const latency = baseMs + z * varianceMs;
	return Math.max(0.001, latency / 1000); // Convert to seconds, minimum 1ms
}

// Function to generate payload sizes (power-law distribution)
function getRandomPayloadSize() {
	const rand = Math.random();
	if (rand < 0.5) return Math.floor(Math.random() * 1000); // Small payloads (0-1KB)
	if (rand < 0.8) return 1000 + Math.floor(Math.random() * 9000); // Medium (1-10KB)
	if (rand < 0.95) return 10000 + Math.floor(Math.random() * 90000); // Large (10-100KB)
	return 100000 + Math.floor(Math.random() * 900000); // Very large (100KB-1MB)
}

// Generate random data
console.log('Generating random summary data...\n');

// Generate API latency data
for (let i = 0; i < 200000; i++) {
	const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
	const method = methods[Math.floor(Math.random() * methods.length)];

	// Different endpoints have different latency characteristics
	let baseLatency, variance;
	if (endpoint === '/api/search') {
		baseLatency = 200;
		variance = 150;
	} else if (endpoint === '/api/orders') {
		baseLatency = 150;
		variance = 100;
	} else {
		baseLatency = 50;
		variance = 30;
	}

	const latency = getRandomLatency(baseLatency, variance);
	apiLatency.observe({ endpoint, method }, latency);
}

// Generate database query data
for (let i = 0; i < 150000; i++) {
	const queryType = queryTypes[Math.floor(Math.random() * queryTypes.length)];
	const table = tables[Math.floor(Math.random() * tables.length)];

	// SELECTs are generally faster, writes are slower
	let baseLatency, variance;
	if (queryType === 'SELECT') {
		baseLatency = 20;
		variance = 15;
	} else {
		baseLatency = 80;
		variance = 40;
	}

	const duration = getRandomLatency(baseLatency, variance);
	databaseQueryDuration.observe({ query_type: queryType, table }, duration);
}

// Generate payload size data
for (let i = 0; i < 100000; i++) {
	const contentType =
		contentTypes[Math.floor(Math.random() * contentTypes.length)];
	const size = getRandomPayloadSize();

	payloadSize.observe({ content_type: contentType }, size);
}

console.log('Generated data:');
console.log('- 20,000 API latency observations');
console.log('- 15,000 database query durations');
console.log('- 10,000 payload size measurements');
console.log('==========================================\n');

// Output the metrics
console.log(register.metrics());
