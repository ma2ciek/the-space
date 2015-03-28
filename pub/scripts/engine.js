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
		canvas.width = window.innerWidth - editor.on * editor.width();
		canvas.height = window.innerHeight;
		$('#game').attr('width', canvas.width + 'px');
		$('#game').attr('height', canvas.height + 'px');
		player.mouse.x = canvas.width / 2;
		player.mouse.y = canvas.height / 2;
	}
}

var player = {
	x: -5000,
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
Camera.prototype.zoom = function(e) {
	if ($(e.target).closest('canvas').length > 0) {
		e.preventDefault();
		var delta = -e.originalEvent.deltaY;
		player.camera.distance += delta;
		if (player.camera.distance > 4000) player.camera.distance = 4000;
		if (player.camera.distance < 1000) player.camera.distance = 1000;
	}
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

function Shape(type, x, y, z, size, rot, rotSp) {
	var proto, max_vis_sides;
	if (typeof size == 'number') {
		var s = size;
		size = [s, s, s];
	}
	this.type = type;

	this.pos = {
		x: x,
		y: y,
		z: z
	};
	this.size = {
		x: size[0],
		y: size[1],
		z: size[2]
	};

	switch (type) {
		case 'cube':
			proto = cube_proto;
			break;
		case 'diamond':
			proto = diamond_proto;
			break;
		case 'dach':
			proto = dach_proto;
			break;
		case 'podstawa':
			proto = podstawa_proto;
			break;
		case 'komin':
			proto = komin_proto;
			break;
		case 'ground':
			create_ground(20, 20);
			proto = ground_proto;
			break;
		default:
			console.error('Brak figury: ' + type);
			break;
	};

	if(max_vis_sides === undefined) max_vis_sides = proto.sides.length;

	this.vertices = []

	for (var i = 0; i < proto.vertices.length; i++) {
		this.vertices.push({
			x: proto.vertices[i][0],
			y: proto.vertices[i][1],
			z: proto.vertices[i][2],
		})
	}
	this.sides = [];
	for (var i = 0; i < proto.sides.length; i++) {
		if (typeof proto.sides[i][0] == 'string') {
			this.sides.push({
				color: proto.sides[i][0],
				vert: proto.sides[i].slice(1)
			});
		} else {
			this.sides.push({
				color: 'rgba(' + los(255) + ',' + los(255) + ',' + los(255) + ',' + 0.5 +')',
				vert: proto.sides[i].slice(0)
			});
		}
	}

	
	if(!rotSp) {
		rotSp = [0,0,0];
		this.isRotate = 0;
	}
	else this.isRotate = 1;
	this.rotSp = {
		x: 0 || rotSp[0] * 2*Math.PI / 1000,
		y: 0 || rotSp[1] * 2*Math.PI / 1000,
		z: 0 || rotSp[2] * 2*Math.PI / 1000,
	};
	if(!rot) rot = [0,0,0];
	this.rot = {
		x: 0 || rot[0],
		y: 0 || rot[1],
		z: 0 || rot[2],
	};
	this.max_vis_sides = max_vis_sides;
}

Shape.prototype.rotate = function() {
	for (var i = 0; i < this.vertices.length; i++) {

		var v = this.vertices[i];

		this.rot.x += this.rotSp.x;
		this.rot.y += this.rotSp.y;
		this.rot.z += this.rotSp.z;

		var x = v.x;
		var y = v.y;
		var z = v.z;

		v.realPos = {};

		v.realPos.z = z * Math.cos(this.rot.x) - y * Math.sin(this.rot.x);
		v.realPos.y = z * Math.sin(this.rot.x) + y * Math.cos(this.rot.x);

		z = v.realPos.z;
		y = v.realPos.y;

		v.realPos.x = z * Math.sin(this.rot.y) + x * Math.cos(this.rot.y);
		v.realPos.z = z * Math.cos(this.rot.y) - x * Math.sin(this.rot.y);

		x = v.realPos.x;
		
		v.realPos.x = x * Math.cos(this.rot.z) - y * Math.sin(this.rot.z);
		v.realPos.y = x * Math.sin(this.rot.z) + y * Math.cos(this.rot.z);
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
		var pos = ob[i].pos;
		ob_array.push({
			key: i,
			dist_sq: Math.sq_sum(pos.x - player.x, pos.y - player.y, pos.z - player.z),
			type: ob[i].type
		});
	}
	ob_array.sort(function(a, b) {
		if(b.type == 'ground') return Infinity ;
		else if(a.type == 'ground') return -Infinity;
		else return b.dist_sq - a.dist_sq;
	})



	for (var j = 0; j < ob.length; j++) {

		var o = ob[ob_array[j].key];
		o.hidden = true;

		if(o.isRotate == 1) o.rotate();
		var vectors = [];

		/* Pomocnicze */
		var max_dist = 0;
		for (var i = 0; i < o.vertices.length; i++) {
			if(o.isRotate == 1) {
				var realVertex = {
					x: o.vertices[i].realPos.x * o.size.x / 2 + o.pos.x,
					y: o.vertices[i].realPos.y * o.size.y / 2 + o.pos.y,
					z: o.vertices[i].realPos.z * o.size.z / 2 + o.pos.z
				}
				delete o.vertices[i].realPos;
			}
			else 
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

			v1.screenX = (v3.x * c.distance / (v3.y) + c.width / 2).toFixed(2);
			v1.screenY = (v3.z * c.distance / (v3.y) + c.height / 2).toFixed(2);
			o.vertices[i].screenX = v1.screenX;
			o.vertices[i].screenY = v1.screenY;

			if (v3.y < 0) v1.hidden = true;


			if (v1.screenX > 0 && v1.screenX < canvas.width && v1.screenY > 0 && v1.screenY < canvas.height) {
				o.hidden = false;
			}
		}
		window.vectors = vectors;

		if (o.hidden) continue;


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

			try {
				ctx.moveTo(v[side.vert.length - 1].screenX, v[side.vert.length - 1].screenY);
				for (var k = 0; k < side.vert.length; k++) {
					ctx.lineTo(v[k].screenX, v[k].screenY);
				}
			} catch(err) {
				console.log(v, side, err);
			}

			ctx.fill();
			ctx.stroke();
			ctx.closePath();
		}
		delete o.dist_sq;
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