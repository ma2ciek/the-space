"use strict";

Math.sq_sum = function() {
	var sum = 0;
	for(var i=0; i<arguments.length; i++) {
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
	this.size = Math.sqrt(Math.sq_sum(this.x, this.y, this.z))
	this.unit = {
		x: this.x / this.size,
		y: this.y / this.size,
		z: this.z / this.size,
	}
}


var los = function(x) { 
	return Math.floor(Math.random() * x)
}