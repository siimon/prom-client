import promClient from '../index.js';

setImmediate(async () => {
	// Create a new Registry
	const register = new promClient.Registry();

	// Create Counters for different metrics
	const httpRequestsTotal = new promClient.Counter({
		name: 'http_requests_total',
		help: 'Total number of HTTP requests',
		labelNames: ['method', 'route', 'status_code'],
		registers: [register],
	});

	const errorCounter = new promClient.Counter({
		name: 'application_errors_total',
		help: 'Total number of application errors',
		labelNames: ['error_type', 'service'],
		registers: [register],
	});

	const eventsProcessed = new promClient.Counter({
		name: 'events_processed_total',
		help: 'Total number of events processed',
		labelNames: ['event_type', 'source'],
		registers: [register],
	});

	// Simulation data
	const methods = ['GET', 'POST', 'PUT', 'DELETE'];
	const routes = ['/api/users', '/api/products', '/api/orders', '/api/auth'];
	const statusCodes = ['200', '201', '400', '404', '500'];
	const errorTypes = [
		'validation',
		'database',
		'network',
		'timeout',
		'permission',
	];
	const services = ['user-service', 'order-service', 'payment-service'];
	const eventTypes = [
		'user.created',
		'order.placed',
		'payment.completed',
		'item.shipped',
	];
	const sources = ['web', 'mobile', 'api', 'background-job'];

	// Generate random data
	console.log('Generating random counter data...\n');

	// Generate HTTP request data (simulate high traffic)
	for (let i = 0; i < 5000000; i++) {
		const method = methods[Math.floor(Math.random() * methods.length)];
		const route = routes[Math.floor(Math.random() * routes.length)];
		const statusCode =
			statusCodes[Math.floor(Math.random() * statusCodes.length)];

		httpRequestsTotal.inc({ method, route, status_code: statusCode });
	}

	// Generate error data (less frequent)
	for (let i = 0; i < 150000; i++) {
		const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
		const service = services[Math.floor(Math.random() * services.length)];

		// Some errors occur more frequently
		const increment =
			Math.random() < 0.8 ? 1 : Math.floor(Math.random() * 5) + 1;
		errorCounter.inc({ error_type: errorType, service }, increment);
	}

	// Generate events processed data
	for (let i = 0; i < 2500000; i++) {
		const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
		const source = sources[Math.floor(Math.random() * sources.length)];

		eventsProcessed.inc({ event_type: eventType, source });
	}

	console.log('Generated data:');
	console.log('- 50,000 HTTP requests');
	console.log('- 1,500+ application errors');
	console.log('- 25,000 events processed');
	console.log('==========================================\n');

	// Output the metrics
	console.log(await register.metrics());
}, 1000);
