import { group, bench, run } from 'mitata';
import RBTree from '../lib/bintrees/rbtree.js';

// Comparator function for numbers
const compareNumbers = (a, b) => a - b;

// Comparator function for objects with 'value' property
const compareObjects = (a, b) => a.value - b.value;

group('RBTree insert operations', () => {
	bench('insert 10 sequential values', () => {
		const tree = new RBTree(compareNumbers);
		for (let i = 0; i < 10; i++) {
			tree.insert(i);
		}
	});

	bench('insert 100 sequential values', () => {
		const tree = new RBTree(compareNumbers);
		for (let i = 0; i < 100; i++) {
			tree.insert(i);
		}
	});

	bench('insert 1000 sequential values', () => {
		const tree = new RBTree(compareNumbers);
		for (let i = 0; i < 1000; i++) {
			tree.insert(i);
		}
	});

	bench('insert 100 random values', () => {
		const tree = new RBTree(compareNumbers);
		for (let i = 0; i < 100; i++) {
			tree.insert(Math.random() * 10000);
		}
	});

	bench('insert 1000 random values', () => {
		const tree = new RBTree(compareNumbers);
		for (let i = 0; i < 1000; i++) {
			tree.insert(Math.random() * 10000);
		}
	});

	bench('insert 100 reverse sequential values', () => {
		const tree = new RBTree(compareNumbers);
		for (let i = 99; i >= 0; i--) {
			tree.insert(i);
		}
	});
});

group('RBTree find operations', () => {
	const tree100 = new RBTree(compareNumbers);
	for (let i = 0; i < 100; i++) {
		tree100.insert(i);
	}

	const tree1000 = new RBTree(compareNumbers);
	for (let i = 0; i < 1000; i++) {
		tree1000.insert(i);
	}

	const tree10000 = new RBTree(compareNumbers);
	for (let i = 0; i < 10000; i++) {
		tree10000.insert(i);
	}

	bench('find in tree with 100 values', () => {
		tree100.find(50);
	});

	bench('find in tree with 1000 values', () => {
		tree1000.find(500);
	});

	bench('find in tree with 10000 values', () => {
		tree10000.find(5000);
	});

	bench('find non-existent in tree with 1000 values', () => {
		tree1000.find(-1);
	});
});

group('RBTree min/max operations', () => {
	const tree100 = new RBTree(compareNumbers);
	for (let i = 0; i < 100; i++) {
		tree100.insert(Math.random() * 1000);
	}

	const tree1000 = new RBTree(compareNumbers);
	for (let i = 0; i < 1000; i++) {
		tree1000.insert(Math.random() * 1000);
	}

	bench('min with 100 values', () => {
		tree100.min();
	});

	bench('max with 100 values', () => {
		tree100.max();
	});

	bench('min with 1000 values', () => {
		tree1000.min();
	});

	bench('max with 1000 values', () => {
		tree1000.max();
	});
});

group('RBTree iteration operations', () => {
	const tree100 = new RBTree(compareNumbers);
	for (let i = 0; i < 100; i++) {
		tree100.insert(Math.random() * 1000);
	}

	const tree1000 = new RBTree(compareNumbers);
	for (let i = 0; i < 1000; i++) {
		tree1000.insert(Math.random() * 1000);
	}

	bench('iterate all 100 values with each()', () => {
		tree100.each(() => {});
	});

	bench('iterate all 1000 values with each()', () => {
		tree1000.each(() => {});
	});

	bench('iterate 10 values with iterator', () => {
		const iter = tree1000.iterator();
		for (let i = 0; i < 10; i++) {
			iter.next();
		}
	});
});

group('RBTree lowerBound/upperBound operations', () => {
	const tree = new RBTree(compareNumbers);
	for (let i = 0; i < 1000; i++) {
		tree.insert(i * 2); // Even numbers only
	}

	bench('lowerBound exact match', () => {
		tree.lowerBound(500);
	});

	bench('lowerBound between values', () => {
		tree.lowerBound(501);
	});

	bench('upperBound', () => {
		tree.upperBound(500);
	});
});

group('RBTree remove operations', () => {
	bench('insert and remove 100 values', () => {
		const tree = new RBTree(compareNumbers);
		for (let i = 0; i < 100; i++) {
			tree.insert(i);
		}
		for (let i = 0; i < 100; i++) {
			tree.remove(i);
		}
	});

	bench('insert 100, remove 50', () => {
		const tree = new RBTree(compareNumbers);
		for (let i = 0; i < 100; i++) {
			tree.insert(i);
		}
		for (let i = 0; i < 50; i++) {
			tree.remove(i);
		}
	});

	bench('remove from middle', () => {
		const tree = new RBTree(compareNumbers);
		for (let i = 0; i < 100; i++) {
			tree.insert(i);
		}
		tree.remove(50);
	});
});

group('RBTree with complex objects', () => {
	bench('insert 100 objects', () => {
		const tree = new RBTree(compareObjects);
		for (let i = 0; i < 100; i++) {
			tree.insert({ value: i, data: `item${i}` });
		}
	});

	bench('find in tree with 100 objects', () => {
		const tree = new RBTree(compareObjects);
		for (let i = 0; i < 100; i++) {
			tree.insert({ value: i, data: `item${i}` });
		}
		tree.find({ value: 50 });
	});
});

group('RBTree clear operation', () => {
	bench('clear tree with 100 values', () => {
		const tree = new RBTree(compareNumbers);
		for (let i = 0; i < 100; i++) {
			tree.insert(i);
		}
		tree.clear();
	});

	bench('clear tree with 1000 values', () => {
		const tree = new RBTree(compareNumbers);
		for (let i = 0; i < 1000; i++) {
			tree.insert(i);
		}
		tree.clear();
	});
});

run();
