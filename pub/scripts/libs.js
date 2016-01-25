"use strict";

Math.sq_sum = function() {
	var sum = 0;
	for (var i = 0; i < arguments.length; i++) {
		sum += arguments[i] * arguments[i];
	}
	return sum;
}
var rot3d = function(obj, rad, rotX, rotY, rotZ) {


}

var Vector3D = function(o1, o2) {
	this.x = o1.x - o2.x;
	this.y = o1.y - o2.y;
	this.z = o1.z - o2.z;
	this.size = Math.sqrt(Math.sq_sum(this.x, this.y, this.z));

	this.hidden = false;
	this.hidden2 = false;

	this.screenX = 0;
	this.screenY = 0;
}

var Point = function(x, y, z) {
	this.x = x;
	this.y = y;
	this.z = z;
}


var los = function(x) {
	return Math.random() * x | 0;
}

var abort = function(e) {
	e.preventDefault();
}


// Jeszcze nie działa...
function col_point_shape(point, vertices) { // tylko dla wypukłych figur
	var a = [],
		b = [], // współczynniki równań liniowych
		v1, v2, // wierzchołki
		w, // warunki
		l = vertices.length;

	for (var i = 0; i < l; i++) {
		v1 = vertices[i];
		v2 = vertices[(i + 1) % l];

		a[i] = (v1.y - v2.y) / (v1.x - v2.x);
		b[i] = v1.y - a[i] * v1.x;
	}
	for (var i = 0; i < l; i++) {
		v1 = vertices[i];
		v2 = vertices[(i + 1) % l];
		var v3 = vertices[(i + 2) % l];

		var d = Math.sqrt(Math.sq_sum(v1.x - v2.x, v1.y - v2.y));

		var alpha = Math.acos((v2.x - v1.x) / d) * Math.sign(v2.x - v1.x);


		var Py = (point.y - v1.y) * Math.sin(alpha) + (point.x - v1.x) * Math.cos(alpha)
		var Vy = (v3.y - v1.y) * Math.sin(alpha) + (v3.x - v1.x) * Math.cos(alpha)


		w = (Math.sign(Vy) == Math.sign(Py));

		console.log(i, w, v1, v2, alpha, Py, Vy);
	}
	return 1;
}