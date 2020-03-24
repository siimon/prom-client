'use strict';

// Counter
// Single Label
// Multiple Values

const { Counter, register } = require('..');
const c = new Counter({
	name: 'test_counter',
	help: 'Example of a counter',
	labelNames: ['code'],
});

c.inc({ code: 200 });
console.log(register.metrics());

/*
# HELP test_counter Example of a counter
# TYPE test_counter counter
test_counter{code="200"} 1
*/

c.inc({ code: 200 });
console.log(register.metrics());

/*
# HELP test_counter Example of a counter
# TYPE test_counter counter
test_counter{code="200"} 2
*/

c.inc();
console.log(register.metrics());

/*
# HELP test_counter Example of a counter
# TYPE test_counter counter
test_counter{code="200"} 2
test_counter 1
*/

c.reset();
console.log(register.metrics());

/*
# HELP test_counter Example of a counter
# TYPE test_counter counter
*/

c.inc(15);
console.log(register.metrics());

/*
# HELP test_counter Example of a counter
# TYPE test_counter counter
test_counter 15
*/

c.inc({ code: 200 }, 12);
console.log(register.metrics());

/*
# HELP test_counter Example of a counter
# TYPE test_counter counter
test_counter 15
test_counter{code="200"} 12
*/

c.labels('200').inc(12);
console.log(register.metrics());

/*
# HELP test_counter Example of a counter
# TYPE test_counter counter
test_counter 15
test_counter{code="200"} 24
*/
