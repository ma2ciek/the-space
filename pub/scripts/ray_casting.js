function ray_casting_render() {
	// uwaga z i!!!

	var vectors = [];
	var sides = [];
	var c = player.camera;

	for(var =0; i<ob.length; i++) {
		var o = ob[i];

		// Utworzenie wektorów ze współrzędnych gracza i wierzchołków
		vectors[i] = [];
		for (var i = 0; i < o.vertices.length; i++) {
			var realVertex = {
				x: o.vertices[i].x * o.size.x / 2 + o.pos.x,
				y: o.vertices[i].y * o.size.y / 2 + o.pos.y,
				z: o.vertices[i].z * o.size.z / 2 + o.pos.z
			}
			vectors[i].push(new Vector3D(realVertex, player));			
		}


		// Wczytanie wszystkich ścian
		// Dodanie id obiektu nadrzędnego

		// DO DODANIA ALGORYTM SPRAWDZAJĄCY CZY PRZYNAJMNIEJ JEDEN WIERZCHOŁEK JEST W POLU WIDZENIA

		for(var j=0; j<ob[i].sides.length; j++) {
			sides.push({
				color: ob[i].sides[j].color,
				vert: ob[i].sides[j].vert.slice(0),
				vectors: vectors[i].slice(0),
				parentId: i
			})
		}
	}

	// Olbrzymia pętla po wszystkim :D
	for (var i = 0; i < canvas.height; i++) {
		for (var j = 0; j < canvas.width; j++) {

			var min_dist = Infinity;

			// kąt padania na ekran
				var ekran_alpha = (canvas.width / 2 - j) / c.distance;
				var ekran_beta = (canvas.height / 2 - i) / c.distance;

			for (var k = 0; k < sides.length; k++) {

				// dla każdego z trzech wierzchołków relatywizuję x, y, z
				var w = [];
				for(var l=1; l<4; l++) {
					// Zaczynam od 1, żeby się numerki później zgadzały
					var v1 = sides[k].vectors[l];

					var v2 = {};
					v2.x = v1.y * Math.cos(-c.alpha + ekran_apha) - v1.x * Math.sin(-c.alpha + ekran_alpha);
					v2.y = v1.y * Math.sin(-c.alpha + ekran_alpha) + v1.x * Math.cos(-c.alpha + ekran_alpha);
					v2.z = v1.z

					w[l] = {};
					var v3 = w[l];

					v3.x = v2.x;
					v3.y = v2.z * Math.sin(c.beta + ekran_beta) + v2.y * Math.cos(c.beta + ekran_beta);
					v3.z = -v2.z * Math.cos(c.beta + ekran_beta) + v2.y * Math.sin(c.beta + ekran_beta);

				}
				
				// Różnice współrzędnych wierzchołków płaszczyzny:
				var x1 = w[1].x - w[2].x;
				var x2 = w[2].x - w[3].x;
				var y1 = w[1].y - w[2].y;
				var y2 = w[2].y - w[3].y;
				var z1 = w[1].z - w[2].z;
				var z2 = w[2].z - w[3].z;

				// Płaszczyzna z = a*x + b*y + c
				var P = { 
					b: (x1 * z2 - x2 * z1) / (x2 * y1 + x1 * y2),
					a: (x1 + b * y1) / x1,
					c: -alpha * w[1].x - b * w[1].y,
					minX: Math.min(w[1].x, w[2].x, w[3].x),
					// do dodania maxX, minZ, maxZ
				}

			
				var X; // Przecięcie - do dodania

			}
		}
	}
}