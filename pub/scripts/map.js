"use strict";

//################################## CREATING OBJECTS ####################################

ob.push(new Shape('diamond', -1000, 2500, 0, [200, 200, 500]));

for (var i = 2; i < 6; i++) {
	for (var j = 2; j < 6; j++) {
		ob.push(new Shape('cube', i * 500, j * 500, 0, 200));
		ob.push(new Shape('cube', i * 500, j * 500, 500, 200, 1));
	}
}
ob[0].rotateZ = 0.01;
ob[1].rotateX = 0.01;
ob[1].rotateZ = 0.01;
ob[2].rotateY = 0.025;

ob.push(new Shape('podstawa', -1000, -1000, -600, [1200, 800, 600]));
ob.push(new Shape('dach', -1000, -1000, 0, [1400, 1000, 600]));
ob.push(new Shape('komin', -1000, -800, 100, [100, 100, 200]))

/*
ob.push(new Shape('cube', board.minX, board.minY, board.minZ, [board.maxX - board.minX, board.maxY - board.minY, 1]))
ob.push(new Shape('cube', board.minX, board.minY, board.maxZ, [board.maxX - board.minX, board.maxY - board.minY, 1]))

*/
