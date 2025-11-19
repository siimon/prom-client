import promClient from '../index.js';

// Create a new Registry
const register = new promClient.Registry();

// Create a Histogram with custom buckets
const httpRequestDuration = new promClient.Histogram({
	name: 'http_request_duration_seconds',
	help: 'Duration of HTTP requests in seconds',
	labelNames: ['method', 'route', 'status_code'],
	buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
	registers: [register],
});

// Methods and routes to simulate
const methods = ['GET', 'POST', 'PUT', 'DELETE'];
const routes = ['/api/users', '/api/products', '/api/orders', '/api/auth'];
const statusCodes = ['200', '201', '400', '404', '500'];

// Function to generate random duration (weighted towards faster responses)
function getRandomDuration() {
	const rand = Math.random();
	if (rand < 0.7) return Math.random() * 0.1; // 70% fast responses (0-100ms)
	if (rand < 0.9) return 0.1 + Math.random() * 0.4; // 20% medium (100-500ms)
	return 0.5 + Math.random() * 4.5; // 10% slow responses (500ms-5s)
}

// Generate random data
console.log('Generating random histogram data...\n');

for (let i = 0; i < 1000000; i++) {
	const method = methods[Math.floor(Math.random() * methods.length)];
	const route = routes[Math.floor(Math.random() * routes.length)];
	const statusCode =
		statusCodes[Math.floor(Math.random() * statusCodes.length)];
	const duration = getRandomDuration();

	httpRequestDuration.observe(
		{ method, route, status_code: statusCode },
		duration,
	);
}

console.log('Generated 10,000 observations');
console.log('==========================================\n');

// Output the metrics
console.log(await register.metrics());
