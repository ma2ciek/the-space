function main() {
	player.camera = new Camera(2000, Math.PI / 2);
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
		this.width = window.innerWidth;
		this.height = window.innerHeight;
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
	speed: 10,
	rotate: 0,
	mouse: {
		x: canvas.width / 2,
		y: canvas.height / 2
	}
}

var ctx;

var board = {
	minX: -20000,
	minY: -20000,
	minZ: -1000,

	maxX: 20000,
	maxY: 20000,
	maxZ: 1000,
}

var Camera = function(distance, alpha) {
	this.width = canvas.width;
	this.height = canvas.height;
	this.distance = distance;
	this.alpha = alpha;
	this.fishEye = true;
}
Camera.prototype.rotate = function(rotation) {
	var x = Math.floor((this.alpha + rotation / 100) / 2 / Math.PI)
	this.alpha = (this.alpha + rotation / 100) - x * 2 * Math.PI;
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

function event_handlers() {
	$('canvas').mousemove(function(event) {
		player.mouse.x = event.pageX - $(event.target).offset().left;
		player.mouse.y = event.pageY - $(event.target).offset().top;
	});
	$(window).keydown(function(e) {
		switch (e.which) {
			case 9: //tab
				player.camera.fishEye = !player.camera.fishEye;
				return false;
				break;
			case 87:
				player.straight = 1;
				break;
			case 83:
				player.straight = -1;
				break;
			case 68:
				player.across = 1;
				break;
			case 65:
				player.across = -1;
				break;
			case 38:
				//player.dirZ = -1;
				break;
			case 40:
				//player.dirZ = 1;
				break;
			case 81: // Q
				//player.rotate = 1;
				break;
			case 69: // E
				//player.rotate = -1;
				break;
		}
	}).keyup(function(e) {
		switch (e.which) {
			case 87:
				player.straight = 0;
				break;
			case 83:
				player.straight = 0;
				break;
			case 65:
				player.across = 0;
				break;
			case 68:
				player.across = 0;
				break;
			case 38:
				//player.dirZ = 0;
				break;
			case 40:
				//player.dirZ = 0;
				break;
			case 81: // Q
				//player.rotate = 0;
				break;
			case 69: // E
				//player.rotate = 0;
				break;
		}
	})
	$('body').bind('mousewheel', function(e) {
		if ($(e.target).closest('canvas').length > 0) {
			e.preventDefault();
			var delta = -e.originalEvent.deltaY;
			player.camera.distance += delta;
			if (player.camera.distance > 2000) player.camera.distance = 2000;
			if (player.camera.distance < 1000) player.camera.distance = 1000;
		}
	})
	$('html body').resize(function() {
		canvas.adjust();
	})
}

function setCanvasDim() {
	$('canvas')[0].width = canvas.width;
	$('canvas')[0].height = canvas.height;

}


var Cuboid = function(x, y, z, Sx, Sy, Sz) {
	if(!Sy) {
		Sy = Sx;
		Sz = Sx;
	}
	this.vertex = [];
	for (var i = 0; i < cube_proto.vertex.length; i++) {
		this.vertex.push({
			x: cube_proto.vertex[i][0] * Sx / 2 + x,
			y: cube_proto.vertex[i][1] * Sy / 2 + y,
			z: cube_proto.vertex[i][2] * Sz / 2 + z
		});
	}
	this.connections = cube_proto.connections;
	this.sites = cube_proto.sites;
	this.type = 'cuboid';
	this.pos = {
		x: x,
		y: y,
		z: z
	}
	this.max_vis_sides = 3;
}

var Diamond = function(x, y, z, Sx, Sy, Sz) {
	if(!Sy) {
		Sy = Sx;
		Sz = Sx;
	}
	this.vertex = [];
	for (var i = 0; i < diamond_proto.vertex.length; i++) {
		this.vertex.push({
			x: diamond_proto.vertex[i][0] * Sx / 2 + x,
			y: diamond_proto.vertex[i][1] * Sy / 2 + y,
			z: diamond_proto.vertex[i][2] * Sz / 2 + z
		});
	}
	this.connections = diamond_proto.connections;
	this.sites = diamond_proto.sites;
	this.type = 'diamond';
	this.pos = {
		x: x,
		y: y,
		z: z
	}
	this.max_vis_sides = 5;
}

var ob = [];

function create_objs() {
	//ob.push(new Cuboid(-900, 3000, -200, 500, 200, 200));

	ob.push(new Cuboid(000, 2000, 000, 200, 200, 200));
	ob.push(new Cuboid(000, 2000, 500, 200, 200, 200));
	ob.push(new Cuboid(500, 2000, 500, 200, 200, 200));
	ob.push(new Cuboid(500, 2000, 000, 200, 200, 200));

	ob.push(new Cuboid(000, 2500, 000, 200, 200, 200));
	ob.push(new Cuboid(000, 2500, 500, 200, 200, 200));
	ob.push(new Cuboid(500, 2500, 500, 200, 200, 200));
	ob.push(new Cuboid(500, 2500, 000, 200, 200, 200));

	ob.push(new Cuboid(1000, 2000, 000, 200, 200, 200));
	ob.push(new Cuboid(1000, 2000, 500, 200, 200, 200));
	ob.push(new Cuboid(1500, 2000, 500, 200, 200, 200));
	ob.push(new Cuboid(1500, 2000, 000, 200, 200, 200));

	ob.push(new Cuboid(1000, 2500, 000, 200, 200, 200));
	ob.push(new Cuboid(1000, 2500, 500, 200, 200, 200));
	ob.push(new Cuboid(1500, 2500, 500, 200, 200, 200));
	ob.push(new Cuboid(1500, 2500, 000, 200, 200, 200));

	ob.push(new Diamond(-900, 3000, -200, 500, 500, 500))
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
		ob[i].dist_sq = square_sum(o.x - player.x, o.y - player.y, o.z - player.z);
	}
	ob.sort(function(a, b) {
		return b.dist_sq - a.dist_sq;
	})



	for (var j = 0; j < ob.length; j++) {
		var vectors = [];
		var o = ob[j];
		o.hidden = false;
		/* Pomocnicze */
		var max_dist = 0;
		var hidden_vertex = null;
		for (var i = 0; i < o.vertex.length; i++) {
			vectors.push(new Vector3D(o.vertex[i], player));
			var v1 = vectors[i];
			v1.screenX = v1.x / v1.y * c.distance + c.width / 2;

			var c = player.camera;


			var dist = Math.sqrt(square_sum(v1.x, v1.y));

			var b = c.alpha - Math.acos(v1.x / dist) * Math.sign(v1.y);


			while (b > Math.PI) b -= 2 * Math.PI;
			while (b < -Math.PI) b += 2 * Math.PI;
			if (b > Math.PI / 2 || b < -Math.PI / 2) {
				o.hidden = true;
				break;
			}
			
			if (c.fishEye) {
				// Ukrywa obiekty, które są za kamerą
				v1.screenX = c.distance * b + c.width / 2;
			} else {
				v1.screenX = c.distance * Math.sin(b) + c.width / 2;
			}


			/*
			b = -c.beta  + Math.acos(dist / v1.size) * Math.sign(v1.z);
			if(b > Math.PI) b -= 2*Math.PI;
			if(b < -Math.PI) b += 2*Math.PI;
			v1.screenY = c.distance * b + c.height / 2;
			*/

			v1.screenY = v1.z / dist * c.distance + c.height / 2;

			v1.origY = o.vertex[i].y;
		}

		if (o.hidden) continue;

		var sites_arr = [];
		/* SITES */
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
	this.size = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	this.unit = {
		x: this.x / this.size,
		y: this.y / this.size,
		z: this.z / this.size,
	}
}

function move_player() {
	var Vx = Math.cos(player.camera.alpha);
	var Vy = Math.sin(player.camera.alpha)
	player.x += player.speed * (player.straight * Vx + player.across * Vy)
	player.y += player.speed * (player.straight * Vy - player.across * Vx);
	player.camera.rotate(player.rotate);

	if (player.mouse.x < canvas.width / 2 - 100 || player.mouse.x > canvas.width / 2 + 100) {
		player.camera.rotate((canvas.width / 2 - player.mouse.x) / 300);
	}

	if (player.mouse.y < canvas.height / 2 - 100 || player.mouse.y > canvas.height / 2 + 100) {
		player.z -= (canvas.height / 2 - player.mouse.y) / 30;
	}

	if(player.z > board.maxZ) player.z = board.maxZ;
	if(player.z < board.minZ) player.z = board.minZ;

	if(player.x > board.maxX) player.x = board.maxX;
	if(player.x < board.minX) player.x = board.minX;

	if(player.y > board.maxY) player.y = board.maxY;
	if(player.y < board.minY) player.y = board.minY;
}


function draw_miniMap() {
	ctx.beginPath();
	ctx.stokeStyle = 'rgba(0, 0, 0, 0.5)';
	ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
	ctx.arc(canvas.width - 70, 70, 50, 0, 2*Math.PI)
	ctx.stroke();
	ctx.fill();
	ctx.closePath();

	ctx.beginPath();
	ctx.fillStyle = '#EEE';
	var angle = canvas.width / player.camera.distance;
	ctx.moveTo(canvas.width - 70, 70);
	ctx.arc(canvas.width - 70, 70, 50, -player.camera.alpha - angle/2, -player.camera.alpha +angle/2, false)

	ctx.fill();2
	ctx.closePath();
}

function draw_MS_FPS(ms) {

	frame_times.arr.push(ms || 0);
	frame_times.sum += ms || 0;
	if(frame_times.arr.length > 50) frame_times.sum -= frame_times.arr.shift();
	var av_ms = frame_times.sum / frame_times.arr.length;

	ctx.font = '15px Arial'
	ctx.fillStyle = 'black';
	ctx.fillText('FPS: ' + Math.floor(1000 / av_ms), 20, 20)
}

var frame_times = {
	sum: 0,
	arr: []
}