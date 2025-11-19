'use strict';

/*
 * Red-Black Tree implementation
 *
 * Copyright (C) 2011 by Vadim Graboys
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

const TreeBase = require('./treebase');

function Node(data) {
	this.data = data;
	this.left = null;
	this.right = null;
	this.red = true;
}

Node.prototype.get_child = function (dir) {
	return dir ? this.right : this.left;
};

Node.prototype.set_child = function (dir, val) {
	if (dir) {
		this.right = val;
	} else {
		this.left = val;
	}
};

function RBTree(comparator) {
	this._root = null;
	this._comparator = comparator;
	this.size = 0;
}

RBTree.prototype = new TreeBase();

// returns true if inserted, false if duplicate
RBTree.prototype.insert = function (data) {
	let ret = false;

	if (this._root === null) {
		// empty tree
		this._root = new Node(data);
		ret = true;
		this.size++;
	} else {
		const head = new Node(undefined); // fake tree root

		let dir = 0;
		let last = 0;

		// setup
		let gp = null; // grandparent
		let ggp = head; // grand-grand-parent
		let p = null; // parent
		let node = this._root;
		ggp.right = this._root;

		// search down
		while (true) {
			if (node === null) {
				// insert new node at the bottom
				node = new Node(data);
				p.set_child(dir, node);
				ret = true;
				this.size++;
			} else if (is_red(node.left) && is_red(node.right)) {
				// color flip
				node.red = true;
				node.left.red = false;
				node.right.red = false;
			}

			// fix red violation
			if (is_red(node) && is_red(p)) {
				const dir2 = ggp.right === gp;

				if (node === p.get_child(last)) {
					ggp.set_child(dir2, single_rotate(gp, !last));
				} else {
					ggp.set_child(dir2, double_rotate(gp, !last));
				}
			}

			const cmp = this._comparator(node.data, data);

			// stop if found
			if (cmp === 0) {
				break;
			}

			last = dir;
			dir = cmp < 0;

			// update helpers
			if (gp !== null) {
				ggp = gp;
			}
			gp = p;
			p = node;
			node = node.get_child(dir);
		}

		// update root
		this._root = head.right;
	}

	// make root black
	this._root.red = false;

	return ret;
};

// returns true if removed, false if not found
RBTree.prototype.remove = function (data) {
	if (this._root === null) {
		return false;
	}

	const head = new Node(undefined); // fake tree root
	let node = head;
	node.right = this._root;
	let p = null; // parent
	let gp = null; // grand parent
	let found = null; // found item
	let dir = 1;

	while (node.get_child(dir) !== null) {
		const last = dir;

		// update helpers
		gp = p;
		p = node;
		node = node.get_child(dir);

		const cmp = this._comparator(data, node.data);

		dir = cmp > 0;

		// save found node
		if (cmp === 0) {
			found = node;
		}

		// push the red node down
		if (!is_red(node) && !is_red(node.get_child(dir))) {
			if (is_red(node.get_child(!dir))) {
				const sr = single_rotate(node, dir);
				p.set_child(last, sr);
				p = sr;
			} else if (!is_red(node.get_child(!dir))) {
				const sibling = p.get_child(!last);
				if (sibling !== null) {
					if (
						!is_red(sibling.get_child(!last)) &&
						!is_red(sibling.get_child(last))
					) {
						// color flip
						p.red = false;
						sibling.red = true;
						node.red = true;
					} else {
						const dir2 = gp.right === p;

						if (is_red(sibling.get_child(last))) {
							gp.set_child(dir2, double_rotate(p, last));
						} else if (is_red(sibling.get_child(!last))) {
							gp.set_child(dir2, single_rotate(p, last));
						}

						// ensure correct coloring
						const gpc = gp.get_child(dir2);
						gpc.red = true;
						node.red = true;
						gpc.left.red = false;
						gpc.right.red = false;
					}
				}
			}
		}
	}

	// replace and remove if found
	if (found !== null) {
		found.data = node.data;
		p.set_child(p.right === node, node.get_child(node.left === null));
		this.size--;
	}

	// update root and make it black
	this._root = head.right;
	if (this._root !== null) {
		this._root.red = false;
	}

	return found !== null;
};

function is_red(node) {
	return node !== null && node.red;
}

function single_rotate(root, dir) {
	const save = root.get_child(!dir);

	root.set_child(!dir, save.get_child(dir));
	save.set_child(dir, root);

	root.red = true;
	save.red = false;

	return save;
}

function double_rotate(root, dir) {
	root.set_child(!dir, single_rotate(root.get_child(!dir), !dir));
	return single_rotate(root, dir);
}

module.exports = RBTree;
