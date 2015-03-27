"use strict";

function main() {
	player.camera = new Camera(2000, 0, 0);
	event_handlers();
	setCanvasDim();

	ctx = $('#game')[0].getContext('2d');

	loop();
}

var canvas = {
	width: window.innerWidth,
	height: window.innerHeight,
	adjust: function() {
		canvas.width = window.innerWidth - editor.opened * editor.width;
		canvas.height = window.innerHeight;
		$('#game').attr('width', canvas.width + 'px');
		$('#game').attr('height', canvas.height + 'px');
		player.mouse.x = canvas.width / 2;
		player.mouse.y = canvas.height / 2;
	}
}

var player = {
	x: 0,
	y: 0,
	z: 0,
	dirZ: 0,
	straight: 0,
	across: 0,
	camera: {},
	speed: 20,
	rotate: 0,
	mouse: {
		x: canvas.width / 2,
		y: canvas.height / 2
	},
	rotate2: 0
}

var ctx;

var board = {
	minX: -20000,
	minY: -20000,
	minZ: -10000,

	maxX: 20000,
	maxY: 20000,
	maxZ: 10000,
}

var Camera = function(distance, alpha, beta) {
	this.width = canvas.width;
	this.height = canvas.height;
	this.distance = distance;
	this.alpha = alpha || 0;
	this.beta = beta || 0;
	this.speed = 2;
}
Camera.prototype.rotate = function(rotation) {
	var x = Math.floor((this.alpha + rotation / 100) / 2 / Math.PI)
	this.alpha = (this.alpha + rotation / 100) - x * 2 * Math.PI;
}
Camera.prototype.rotate2 = function(rotation) {
	this.beta = (this.beta + rotation / 100);
	if (this.beta > Math.PI / 2) this.beta = Math.PI / 2;
	if (this.beta < -Math.PI / 2) this.beta = -Math.PI / 2;
}

function loop() {

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	move_player();
	draw_objs();
	draw_miniMap();
	draw_MS_FPS(Date.now() - (canvas.ts || Date.now()));
	canvas.ts = Date.now();
	window.requestAnimationFrame(loop);
}

function setCanvasDim() {
	$('#game').attr('width', canvas.width + 'px');
	$('#game').attr('height', canvas.height + 'px');

}

function Shape(type, x, y, z, size, opacity) {
	var proto, max_vis_sides;
	if (typeof size == 'number') {
		var s = size;
		size = [s, s, s];
	}
	this.type = type;
	switch (type) {
		case 'cube':
			proto = cube_proto;
			max_vis_sides = 6;
			break;
		case 'diamond':
			proto = diamond_proto;
			max_vis_sides = 6;
			break;
		case 'dach':
			proto = dach_proto;
			max_vis_sides = 5;
			break;
		case 'podstawa':
			proto = podstawa_proto;
			max_vis_sides = 5;
			break;
		case 'komin':
			proto = komin_proto;
			max_vis_sides = 5;
			break;
		default:
			console.error('Brak figury: ' + type);
			break;
	};

	this.vertices = []

	for (var i = 0; i < proto.vertices.length; i++) {
		this.vertices.push({
			x: proto.vertices[i][0],
			y: proto.vertices[i][1],
			z: proto.vertices[i][2],
		})
	}
	this.sides = [];
	if (opacity == undefined || opacity == null) opacity = 0.5;
	for (var i = 0; i < proto.sides.length; i++) {
		if (typeof proto.sides[i][0] == 'string') {
			this.sides.push({
				color: proto.sides[i][0],
				vert: proto.sides[i].slice(1)
			});
		} else {
			this.sides.push({
				color: 'rgba(' + los(255) + ',' + los(255) + ',' + los(255) + ',' + opacity +')',
				vert: proto.sides[i].slice(0)
			});
		}
	}
	this.pos = {
		x: x,
		y: y,
		z: z
	};
	this.size = {
		x: size[0],
		y: size[1],
		z: size[2]
	}
	this.max_vis_sides = max_vis_sides;
	this.rotateZ = 0;
	this.rotateX = 0;
	this.rotateY = 0;
}

Shape.prototype.rotate = function() {
	for (var i = 0; i < this.vertices.length; i++) {
		var v = this.vertices[i];
		var z = v.z;
		var y = v.y;
		v.z = z * Math.cos(this.rotateX) - y * Math.sin(this.rotateX);
		v.y = z * Math.sin(this.rotateX) + y * Math.cos(this.rotateX);

		var z = v.z;
		var x = v.x;

		v.x = z * Math.sin(this.rotateY) + x * Math.cos(this.rotateY);
		v.z = z * Math.cos(this.rotateY) - x * Math.sin(this.rotateY);

		var x = v.x;
		var y = v.y;
		v.x = x * Math.cos(this.rotateZ) - y * Math.sin(this.rotateZ);
		v.y = x * Math.sin(this.rotateZ) + y * Math.cos(this.rotateZ);
	}
}

var ob = [];

ob.last = function() { 
	return ob[ob.length - 1];
}

function draw_objs() {
	var c = player.camera;
	var colors = [
		'#09f',
		'blue',
		'purple',
		'green',
		'grey',
		'orange',
		'yellow',
		'#983',
	]
	ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';

	//###################### SORTOWANIE OBIEKTÓW ############################

	var ob_array = [];
	for (var i = 0; i < ob.length; i++) {
		var o = ob[i].pos;
		ob_array.push({
			key: i
		});
		ob_array[i].dist_sq = Math.sq_sum(o.x - player.x, o.y - player.y, o.z - player.z);
	}
	ob_array.sort(function(a, b) {
		return b.dist_sq - a.dist_sq;
	})



	for (var j = 0; j < ob.length; j++) {

		var o = ob[ob_array[j].key];

		o.rotate();
		var vectors = [];

		/* Pomocnicze */
		var max_dist = 0;
		for (var i = 0; i < o.vertices.length; i++) {
			var realVertex = {
				x: o.vertices[i].x * o.size.x / 2 + o.pos.x,
				y: o.vertices[i].y * o.size.y / 2 + o.pos.y,
				z: o.vertices[i].z * o.size.z / 2 + o.pos.z
			}
			vectors.push(new Vector3D(realVertex, player));
			var v1 = vectors[i]; // vectors to vertices

			var c = player.camera;

			var v2 = {};
			v2.x = v1.y * Math.cos(-c.alpha) - v1.x * Math.sin(-c.alpha);
			v2.y = v1.y * Math.sin(-c.alpha) + v1.x * Math.cos(-c.alpha);
			v2.z = v1.z

			var v3 = {};
			v3.x = v2.x;
			v3.y = v2.z * Math.sin(c.beta) + v2.y * Math.cos(c.beta);
			v3.z = -v2.z * Math.cos(c.beta) + v2.y * Math.sin(c.beta);

			v1.screenX = v3.x * c.distance / (v3.y) + c.width / 2;
			v1.screenY = v3.z * c.distance / (v3.y) + c.height / 2;
			o.vertices[i].screenX = v1.screenX;
			o.vertices[i].screenY = v1.screenY;

			if (v3.y < 0) v1.hidden = true;


			if (v1.screenX > 0 && v1.screenX < canvas.width && v1.screenY > 0 && v1.screenY < canvas.height) {
				o.disp = 1;
			}
		}
		window.vectors = vectors;

		if (!o.disp) continue;


		//################### SORTOWANIE ŚCIAN ##########################

		var sides_arr = [];
		for (var i = 0; i < o.sides.length; i++) {
			var side = o.sides[i];
			var sum = 0;
			for (var k = 0; k < side.vert.length; k++) {
				sum += vectors[side.vert[k]].size;
			}
			sum /= side.vert.length;
			sides_arr.push({
				key: i,
				dist: sum
			});
		}

		sides_arr.sort(function(a, b) {
			return b.dist - a.dist;
		})

		// 50% SPEED BOOST :D
		var disp_sides_len = sides_arr.length - o.max_vis_sides;

		for (var i = disp_sides_len; i < sides_arr.length; i++) {

			var side = o.sides[sides_arr[i].key];
			var v = [];

			var ret = 0;

			for (var k = 0; k < side.vert.length; k++) {
				v.push(vectors[side.vert[k]]);
				if (v[k].hidden) {
					ret = 1;
				}
			}
			if (ret == 1) continue;

			ctx.beginPath();
			ctx.fillStyle = side.color;

			ctx.moveTo(v[side.vert.length - 1].screenX, v[side.vert.length - 1].screenY);
			for (var k = 0; k < side.vert.length; k++) {


				ctx.lineTo(v[k].screenX, v[k].screenY);
			}

			ctx.fill();
			ctx.stroke();
			ctx.closePath();
		}
		delete o.hidden;
		delete o.dist_sq;
		delete o.disp;
	}
	editor.check_vertex();
}

function move_player() {
	var Vx = Math.cos(player.camera.alpha);
	var Vy = Math.sin(player.camera.alpha);
	player.x += player.speed * player.straight * Vx * Math.cos(player.camera.beta);
	player.y -= player.speed * player.straight * Vy * Math.cos(player.camera.beta);
	player.z += player.speed * player.straight * Math.sin(player.camera.beta);

	player.x += player.speed * player.across * Vy;
	player.y += player.speed * player.across * Vx;


	player.camera.rotate((canvas.width / 2 - player.mouse.x) * player.camera.speed / canvas.width);
	player.camera.rotate2((canvas.height / 2 - player.mouse.y) * player.camera.speed / canvas.height);

	if (player.z > board.maxZ) player.z = board.maxZ;
	if (player.z < board.minZ) player.z = board.minZ;

	if (player.x > board.maxX) player.x = board.maxX;
	if (player.x < board.minX) player.x = board.minX;

	if (player.y > board.maxY) player.y = board.maxY;
	if (player.y < board.minY) player.y = board.minY;
}


function draw_miniMap() {
	ctx.beginPath();
	ctx.stokeStyle = 'rgba(0, 0, 0, 0.5)';
	ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
	ctx.arc(canvas.width - 70, 70, 50, 0, 2 * Math.PI)
	ctx.stroke();
	ctx.fill();
	ctx.closePath();

	ctx.beginPath();
	ctx.fillStyle = '#EEE';
	var angle = canvas.width / player.camera.distance;
	ctx.moveTo(canvas.width - 70, 70);
	ctx.arc(canvas.width - 70, 70, 50, -player.camera.alpha - angle / 2, -player.camera.alpha + angle / 2, false)

	ctx.fill();
	ctx.closePath();
}

function draw_MS_FPS(ms) {

	frame_times.arr.push(ms || 0);
	frame_times.sum += ms || 0;
	if (frame_times.arr.length > 50) frame_times.sum -= frame_times.arr.shift();
	var av_ms = frame_times.sum / frame_times.arr.length;

	ctx.font = '15px Arial';
	ctx.fillStyle = 'black';
	ctx.fillText('FPS: ' + Math.floor(1000 / av_ms), 20, 20)
}

var frame_times = {
	sum: 0,
	arr: []
}