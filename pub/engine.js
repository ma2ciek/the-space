function main() {
	player.camera = new Camera(2000, 0, 0);
	event_handlers();
	setCanvasDim();

	ctx = $('canvas')[0].getContext('2d');

	create_objs();
	loop();
}

var canvas = {
	width: window.innerWidth,
	height: window.innerHeight,
	adjust: function() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		$('canvas').width(canvas.width);
		$('canvas').height(canvas.height)
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
	$('canvas')[0].width = canvas.width;
	$('canvas')[0].height = canvas.height;

}

function Shape(type, x, y, z, size) {
	var proto, sides;
	if (typeof size == 'number') {
		var s = size;
		size = [s, s, s];
	}
	this.type = type;
	switch (type) {
		case 'cube':
			proto = cube_proto;
			sides = 3;
			break;
		case 'diamond':
			proto = diamond_proto;
			sides = 5;
			break;
		default:
			console.error('Brak takiej figury');
			break;
	}
	this.vertex = [];
	for (var i = 0; i < proto.vertex.length; i++) {
		this.vertex.push({
			x: proto.vertex[i][0] * size[0] / 2 + x,
			y: proto.vertex[i][1] * size[1] / 2 + y,
			z: proto.vertex[i][2] * size[2] / 2 + z
		});
	}
	this.connections = proto.connections;
	this.sites = proto.sites;
	this.pos = {
		x: x,
		y: y,
		z: z
	}
	this.max_vis_sides = sides;
	this.rotateZ = 0;
	this.rotateX = 0;
	this.rotateY = 0;
}

Shape.prototype.rotate = function() {
	if (this.rotateX) {
		for (var i = 0; i < this.vertex.length; i++) {
			var v = this.vertex[i];
			var z = v.z - this.pos.z;
			var y = v.y - this.pos.y;
			v.z = z * Math.cos(this.rotateX) - y * Math.sin(this.rotateX) + this.pos.z;
			v.y = z * Math.sin(this.rotateX) + y * Math.cos(this.rotateX) + this.pos.y;
		}
	}
	if (this.rotateY) {
		for (var i = 0; i < this.vertex.length; i++) {
			var v = this.vertex[i];
			var z = v.z - this.pos.z;
			var x = v.x - this.pos.x;
			v.x = z * Math.sin(this.rotateY) + x * Math.cos(this.rotateY) + this.pos.x;
			v.z = z * Math.cos(this.rotateY) - x * Math.sin(this.rotateY) + this.pos.z;
			
		}
	}
	if (this.rotateZ) {
		for (var i = 0; i < this.vertex.length; i++) {
			var v = this.vertex[i];
			var x = v.x - this.pos.x;
			var y = v.y - this.pos.y;
			v.x = x * Math.cos(this.rotateZ) - y * Math.sin(this.rotateZ) + this.pos.x;
			v.y = x * Math.sin(this.rotateZ) + y * Math.cos(this.rotateZ) + this.pos.y;
		}
	}
	
}

var ob = [];

function create_objs() {
	ob.push(new Shape('diamond', -1000, 2500, 0, [200, 200, 500]));

	for (var i = 0; i < 10; i++) {
		for (var j = 0; j < 10; j++) {
			for (var k = 0; k < 2; k++) {
				ob.push(new Shape('cube', i * 500, j * 500, k * 500, 200));
			}
		}
	}
	ob[0].rotateZ = 0.01;
	ob[1].rotateX = 0.01;
	ob[1].rotateZ = 0.01;
	ob[2].rotateY = 0.025;
}

function draw_objs() {
	var c = player.camera;
	var colors = [
		'red',
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

	for (var i = 0; i < ob.length; i++) {
		var o = ob[i].pos;
		ob[i].dist_sq = Math.sq_sum(o.x - player.x, o.y - player.y, o.z - player.z);
	}
	ob.sort(function(a, b) {
		return b.dist_sq - a.dist_sq;
	})



	for (var j = 0; j < ob.length; j++) {
		ob[j].rotate();
		var vectors = [];
		var o = ob[j];
		o.hidden = false;
		/* Pomocnicze */
		var max_dist = 0;
		var disp = 0;
		for (var i = 0; i < o.vertex.length; i++) {
			vectors.push(new Vector3D(o.vertex[i], player));
			var v1 = vectors[i];

			var c = player.camera;
			
			var v2 = {};
			v2.x = v1.y * Math.cos(-c.alpha) - v1.x * Math.sin(-c.alpha);
			v2.y = v1.y * Math.sin(-c.alpha) + v1.x * Math.cos(-c.alpha);
			v2.z = v1.z

			var v3 = {};	
			v3.x = v2.x;
			v3.y = v2.z * Math.sin(c.beta) + v2.y * Math.cos(c.beta);
			v3.z = v2.z * Math.cos(c.beta) - v2.y * Math.sin(c.beta);

			v1.screenX = v3.x * c.distance / (v3.y) + c.width / 2;
			v1.screenY = v3.z * c.distance / (v3.y) + c.height / 2;

			if(v3.y < 0) o.hidden= true;


			if (v1.screenX > 0 && v1.screenX < canvas.width && v1.screenY > 0 && v1.screenY < canvas.height) {
				disp == 1;
			}
		}
		window.vectors = vectors;

		if (o.hidden || disp) continue;


		//################### SORTOWANIE ŚCIAN ##########################

		var sites_arr = [];
		for (var i = 0; i < o.sites.length; i++) {
			var site = o.sites[i];
			var sum = 0;
			for (var k = 0; k < site.length; k++) {
				sum += vectors[site[k]].size;
			}
			sites_arr.push({
				key: i,
				dist: sum
			});
		}

		sites_arr.sort(function(a, b) {
			return b.dist - a.dist;
		})

		// 50% SPEED BOOST :D
		var disp_sides_len = sites_arr.length - o.max_vis_sides;

		for (var i = disp_sides_len; i < sites_arr.length; i++) {

			var site = o.sites[sites_arr[i].key];
			var v = [];

			var ret = 0;

			for (var k = 0; k < site.length; k++) {
				v.push(vectors[site[k]]);
				if (v[k].hidden) {
					ret = 1;
				}
			}
			if (ret == 1) continue;

			ctx.beginPath();
			ctx.fillStyle = colors[sites_arr[i].key];

			ctx.moveTo(v[site.length - 1].screenX, v[site.length - 1].screenY);
			for (var k = 0; k < site.length; k++) {


				ctx.lineTo(v[k].screenX, v[k].screenY);
			}

			ctx.fill();
			ctx.stroke();
			ctx.closePath();
		}
	}
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

function move_player() {
	var Vx = Math.cos(player.camera.alpha);
	var Vy = Math.sin(player.camera.alpha);
	player.x += player.speed * player.straight * Vx * Math.cos(player.camera.beta);
	player.y -= player.speed * player.straight * Vy * Math.cos(player.camera.beta);
	player.z += player.speed * player.straight * Math.sin(player.camera.beta);

	player.x += player.speed * player.across * Vy;
	player.y += player.speed * player.across * Vx;


	player.camera.rotate((canvas.width / 2 - player.mouse.x) / 300);
	player.camera.rotate2(-(canvas.height / 2 - player.mouse.y) / 300);

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
	2
	ctx.closePath();
}

function draw_MS_FPS(ms) {

	frame_times.arr.push(ms || 0);
	frame_times.sum += ms || 0;
	if (frame_times.arr.length > 50) frame_times.sum -= frame_times.arr.shift();
	var av_ms = frame_times.sum / frame_times.arr.length;

	ctx.font = '15px Arial'
	ctx.fillStyle = 'black';
	ctx.fillText('FPS: ' + Math.floor(1000 / av_ms), 20, 20)
}

var frame_times = {
	sum: 0,
	arr: []
}