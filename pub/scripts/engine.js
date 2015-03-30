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
	this.CA = Math.cos(this.alpha);
	this.SA = Math.sin(this.alpha);
	this.beta = beta || 0;
	this.SB = Math.sin(this.beta);
	this.CB = Math.cos(this.beta);
	this.speed = 2;
}
Camera.prototype.rotate = function(rotation) {
	var x = (this.alpha + rotation / 100) / 2 / Math.PI | 0
	this.alpha = (this.alpha + rotation / 100) - x * 2 * Math.PI;
	this.CA = Math.cos(this.alpha);
	this.SA = Math.sin(this.alpha);
}
Camera.prototype.rotate2 = function(rotation) {
	this.beta = (this.beta + rotation / 100);
	if (this.beta > Math.PI / 2) this.beta = Math.PI / 2;
	if (this.beta < -Math.PI / 2) this.beta = -Math.PI / 2;
	this.SB = Math.sin(this.beta);
	this.CB = Math.cos(this.beta);
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
	canvas.renderTime -= Date.now();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	canvas.renderTime += Date.now();
	move_player();
	draw_objs();
	draw_miniMap();
	draw_info(Date.now() - (canvas.ts || Date.now()));
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

	if (max_vis_sides === undefined) max_vis_sides = proto.sides.length;

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
				color: 'rgba(' + los(255) + ',' + los(255) + ',' + los(255) + ',' + 0.5 + ')',
				vert: proto.sides[i].slice(0)
			});
		}
	}


	if (!rotSp) {
		rotSp = [0, 0, 0];
		this.isRotate = 0;
	} else this.isRotate = 1;
	this.rotSp = {
		x: 0 || rotSp[0] * 2 * Math.PI / 1000,
		y: 0 || rotSp[1] * 2 * Math.PI / 1000,
		z: 0 || rotSp[2] * 2 * Math.PI / 1000,
	};
	if (!rot) rot = [0, 0, 0];
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
	canvas.all_display_sides = 0;
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

	canvas.renderTime = 0;
	canvas.sortingTime = 0;
	canvas.mathTime = 0;

	//###################### SORTOWANIE OBIEKTÓW ############################

	canvas.sortingTime -= Date.now();
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
		if (b.type == 'ground') return Infinity;
		else if (a.type == 'ground') return -Infinity;
		else return b.dist_sq - a.dist_sq;
	})
	canvas.sortingTime += Date.now();

	var v1 = {},
		v2 = {},
		v3 = {},
		realVertex = {},
		sides_arr = [];

	for (var j = 0; j < ob.length; j++) {
		canvas.mathTime -= Date.now();

		var o = ob[ob_array[j].key];
		o.hidden = true;

		if (o.isRotate == 1) o.rotate();

		var vectors = [];

		for (var i = 0; i < o.vertices.length; i++) {
			if (o.isRotate == 1) {
				realVertex = new wsp3D(
					o.vertices[i].realPos.x * o.size.x / 2 + o.pos.x,
					o.vertices[i].realPos.y * o.size.y / 2 + o.pos.y,
					o.vertices[i].realPos.z * o.size.z / 2 + o.pos.z
				);
				delete o.vertices[i].realPos;
			} else
				realVertex = new wsp3D(
					o.vertices[i].x * o.size.x / 2 + o.pos.x,
					o.vertices[i].y * o.size.y / 2 + o.pos.y,
					o.vertices[i].z * o.size.z / 2 + o.pos.z
				);
			vectors.push(new Vector3D(realVertex, player));
			v1 = vectors[i]; // vectors to vertices

			v2 = new wsp3D(
				v1.y * c.CA + v1.x * c.SA, 
				-v1.y * c.SA + v1.x * c.CA,
				v1.z
			);

			v3 = new wsp3D(
				v2.x,
				v2.z * c.SB + v2.y * c.CB,
				v2.z * -c.CB + v2.y * c.SB
			);

			v1.screenX = (v3.x * c.distance / (v3.y) + canvas.width / 2);
			v1.screenY = (v3.z * c.distance / (v3.y) + canvas.height / 2);

			o.vertices[i].screenX = v1.screenX;
			o.vertices[i].screenY = v1.screenY;

			if (v3.y < 0) v1.hidden = true;

			v1.hidden2 = true;

			if (v1.screenX > 0 && v1.screenX < canvas.width && v1.screenY > 0 && v1.screenY < canvas.height && v3.y > 0) {
				o.hidden = false;
				v1.hidden2 = false;
			}
		}
		canvas.mathTime += Date.now();

		if (o.hidden) continue;

		//################### SORTOWANIE ŚCIAN ##########################

		canvas.sortingTime -= Date.now();
		sides_arr.length = 0;
		var side, sum;
		
		for (var i = 0; i < o.sides.length; i++) {
			side = o.sides[i];
			sum = 0;
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
		canvas.sortingTime += Date.now();


		// 50% SPEED BOOST :D
		var disp_sides_len = sides_arr.length - o.max_vis_sides;
		var v;
		var ret = 1;

		for (var i = disp_sides_len; i < sides_arr.length; i++) {
			canvas.mathTime -= Date.now();
			
			side = o.sides[sides_arr[i].key];
			v = side.vert;

			ret = 1;

			for (var k = 0; k < v.length; k++) {
				if (vectors[v[k]].hidden) {
					ret = 1;
					break;
				} else if (!vectors[v[k]].hidden2) {
					ret = 0;
				}
			}

			canvas.mathTime += Date.now();
			if (ret == 1) continue;

			canvas.all_display_sides++;


			canvas.renderTime -= Date.now();

			ctx.beginPath();
			ctx.fillStyle = side.color;

			try {
				ctx.moveTo(vectors[v[v.length - 1]].screenX, vectors[v[v.length - 1]].screenY);
				for (var k = 0; k < v.length; k++) {
					ctx.lineTo(vectors[v[k]].screenX, vectors[v[k]].screenY);
				}
			} catch (err) {
				console.log(vectors, side, err);
			}

			ctx.fill();
			ctx.stroke();
			canvas.renderTime += Date.now();
		}
		delete o.dist_sq;
	}
	editor.check_vertex();
}

function move_player() {
	var c = player.camera;

	player.x += player.speed * player.straight * c.CA * c.CB;
	player.y -= player.speed * player.straight * c.SA * c.CB;
	player.z += player.speed * player.straight * c.SB;

	player.x += player.speed * player.across * c.SA;
	player.y += player.speed * player.across * c.CA;


	player.camera.rotate((canvas.width / 2 - player.mouse.x) * player.camera.speed / canvas.width);
	player.camera.rotate2((canvas.height / 2 - player.mouse.y) * player.camera.speed / canvas.height);

	/*
	if (player.z > board.maxZ) player.z = board.maxZ;
	if (player.z < board.minZ) player.z = board.minZ;

	if (player.x > board.maxX) player.x = board.maxX;
	if (player.x < board.minX) player.x = board.minX;

	if (player.y > board.maxY) player.y = board.maxY;
	if (player.y < board.minY) player.y = board.minY;
	*/
}


function draw_miniMap() {
	canvas.renderTime -= Date.now();

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

	canvas.renderTime += Date.now();
}

function draw_info(ms) {

	frame_times.arr.push(ms || 0);
	frame_times.sum += ms || 0;
	if (frame_times.arr.length > 50) frame_times.sum -= frame_times.arr.shift();
	var av_ms = frame_times.sum / frame_times.arr.length;

	canvas.renderTime -= Date.now();
	ctx.font = '15px Arial';
	ctx.fillStyle = 'black';
	ctx.fillText('FPS: ' + (1000 / av_ms | 0), 20, 20)
	ctx.fillText('MS: ' + (av_ms | 0), 20, 40)
	ctx.fillText('Rendered sides: ' + canvas.all_display_sides, 100, 20);
	canvas.renderTime += Date.now();
}

var frame_times = {
	sum: 0,
	arr: []
}