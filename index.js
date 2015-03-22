function main() {
	player.camera = new Camera(1000, 0);
	event_handlers();
	setCanvasDim();

	ctx = $('canvas')[0].getContext('2d');

	create_objs();
	loop();
}

var player = {
	x: 0,
	y: 0,
	z: 0,
	dirX: 0,
	dirY: 0,
	dirZ: 0,
	camera: {},
	mouse: {
		x: 0,
		y: 0
	},
	speed: 5
}

var ctx;

var canvas = {
	width: window.innerWidth,
	height: window.innerHeight,
	adjust: function() {
		this.width = window.innerWidth;
		this.height = window.innerHeight;
	}
}

var Camera = function(distance, alpha) {
	this.width = canvas.width;
	this.height = canvas.height;
	this.distance = distance;
	this.alpha = alpha;
}
Camera.prototype.rotate = function(rotation) {
	//var x = Math.floor((this.alpha + rotation / 100) / 2 / Math.PI)
	//this.alpha = (this.alpha + rotation / 100) - x * 2 * Math.PI;
}

function loop() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	move_player();
	draw_objs();
	window.requestAnimationFrame(loop)
}

function event_handlers() {
	$('canvas').mousemove(function(event) {

		player.camera.rotate(event.pageX - $(event.target).offset().left - player.mouse.x);
		player.mouse.x = event.pageX - $(event.target).offset().left;

	});
	$(window).keydown(function(e) {
		switch (e.which) {
			case 87:
				player.dirZ = -1;
				break;
			case 83:
				player.dirZ = 1;
				break;
			case 65:
				player.dirX = -1;
				break;
			case 68:
				player.dirX = 1;
				break;
			case 38:
				player.dirY = 1;
				break;
			case 40:
				player.dirY = -1;
				break;
		}
	}).keyup(function(e) {
		switch (e.which) {
			case 87:
				player.dirZ = 0;
				break;
			case 83:
				player.dirZ = 0;
				break;
			case 65:
				player.dirX = 0;
				break;
			case 68:
				player.dirX = 0;
				break;
			case 38:
				player.dirY = 0;
				break;
			case 40:
				player.dirY = 0;
				break;
		}
	})
	$('body').bind('mousewheel', function(e) {
		if ($(e.target).closest('canvas').length > 0) {
			e.preventDefault();
			var delta = -e.originalEvent.deltaY;
			player.camera.distance += delta;
			if (player.camera.distance > 2000) player.camera.distance = 2000;
			if (player.camera.distance < 500) player.camera.distance = 500;
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

var ob = [];

function create_objs() {
	//ob.push(new Cuboid(-900, 3000, -200, 500, 200, 200));
	ob.push(new Cuboid(-900, 3000, -200, 500, 500, 500));

	ob.push(new Cuboid(200, 2000, 200, 200, 200, 200));
	ob.push(new Cuboid(200, 2000, 500, 200, 200, 200));
	ob.push(new Cuboid(500, 2000, 500, 200, 200, 200));
	ob.push(new Cuboid(500, 2000, 200, 200, 200, 200));

	ob.push(new Cuboid(200, 2500, 200, 200, 200, 200));
	ob.push(new Cuboid(200, 2500, 500, 200, 200, 200));
	ob.push(new Cuboid(500, 2500, 500, 200, 200, 200));
	ob.push(new Cuboid(500, 2500, 200, 200, 200, 200));
}

function draw_objs() {
	var c = player.camera;
	var colors = [
		'red',
		'blue',
		'purple',
		'green',
		'grey',
		'orange'
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
		/* Pomocnicze */
		var max_dist = 0;
		var hidden_vertex = null;
		for (var i = 0; i < o.vertex.length; i++) {
			vectors.push(new Vector3D(o.vertex[i], player));
			var v1 = vectors[i];
			v1.screenX = v1.x / v1.y * c.distance + c.width / 2;
			v1.screenZ = v1.z / v1.y * c.distance + c.height / 2;
			if (max_dist < vectors[i].size) {
				max_dist = vectors[i].size;
				hidden_vertex = i;
			}
			v1.origY = o.vertex[i].y;
		}

		if (o.type == 'cuboid') vectors[hidden_vertex].hidden = 'true';


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
				if (v[k].origY < player.y) {
					ret = 1;
				}
			}
			if (ret == 1) continue;

			ctx.beginPath();
			ctx.fillStyle = colors[sites_arr[i].key];

			ctx.moveTo(v[site.length - 1].screenX, v[site.length - 1].screenZ);
			for (var k = 0; k < site.length; k++) {


				ctx.lineTo(v[k].screenX, v[k].screenZ);
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
	player.x += player.dirX * player.speed;
	player.y += player.dirY * player.speed;
	player.z += player.dirZ * player.speed;
}