'use strict';

/*
 * Binary Search Tree implementation
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

function BinTree(comparator) {
	this._root = null;
	this._comparator = comparator;
	this.size = 0;
}

BinTree.prototype = new TreeBase();

// returns true if inserted, false if duplicate
BinTree.prototype.insert = function (data) {
	if (this._root === null) {
		// empty tree
		this._root = new Node(data);
		this.size++;
		return true;
	}

	let dir = 0;

	// setup
	let p = null; // parent
	let node = this._root;

	// search down
	while (true) {
		if (node === null) {
			// insert new node at the bottom
			node = new Node(data);
			p.set_child(dir, node);
			this.size++;
			return true;
		}

		// stop if found
		if (this._comparator(node.data, data) === 0) {
			return false;
		}

		dir = this._comparator(node.data, data) < 0;

		// update helpers
		p = node;
		node = node.get_child(dir);
	}
};

// returns true if removed, false if not found
BinTree.prototype.remove = function (data) {
	if (this._root === null) {
		return false;
	}

	const head = new Node(undefined); // fake tree root
	let node = head;
	node.right = this._root;
	let p = null; // parent
	let found = null; // found item
	let dir = 1;

	while (node.get_child(dir) !== null) {
		p = node;
		node = node.get_child(dir);
		const cmp = this._comparator(data, node.data);
		dir = cmp > 0;

		if (cmp === 0) {
			found = node;
		}
	}

	if (found !== null) {
		found.data = node.data;
		p.set_child(p.right === node, node.get_child(node.left === null));

		this._root = head.right;
		this.size--;
		return true;
	} else {
		return false;
	}
};

module.exports = BinTree;
