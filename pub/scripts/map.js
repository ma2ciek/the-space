"use strict";

function map_create() {

	ob.push(new Shape('diamond', -1000, 2500, 0, [200, 200, 500], false, [0, 0, 1]));
	ob.push(new Shape('cube', -500, 1000, 0, 200, false, [1, 0, 1]));

	house(2000, -1400);
	house(2000, 0);
	house(2000, 1400);
	house(2000, 2800);
	house(2000, 4200);

	house(-2000, -1400, Math.PI);
	house(-2000, 0, Math.PI);
	house(-2000, 1400, Math.PI);
	house(-2000, 2800, Math.PI);
	house(-2000, 4200, Math.PI);

	ob.push(new Shape('ground', 1000, 1000, -900, [2000, 2000, 100]));
}

function house (x, y, rot) {
	var z =0;
	if(!rot) rot = 0;
	ob.push(new Shape('podstawa', x, y, z-600, [1200, 800, 600], [0, 0, rot]));
	ob.push(new Shape('dach', x, y, z, [1400, 1000, 600], [0, 0, rot]));

	// póki co z kominem na łatwiznę
	ob.push(new Shape('komin', x, y + 200, z + 100, [100, 100, 200], [0, 0, 0]));
}