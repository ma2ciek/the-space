"use strict";

//################################## CREATING OBJECTS ####################################

ob.push(new Shape('diamond', -1000, 2500, 0, [200, 200, 500], false, [0, 0, 1]));
ob.push(new Shape('cube', -500, 1000, 0, 200, false, [1, 0, 1]));

house(2000, -1400);
house(2000, 0);
house(2000, 1400);
house(2000, 2800);
house(2000, 4200);

ob.push(new Shape('ground', 1000, 1000, -900, [2000, 2000, 100]));

/*
ob.push(new Shape('cube', board.minX, board.minY, board.minZ, [board.maxX - board.minX, board.maxY - board.minY, 1]))
ob.push(new Shape('cube', board.minX, board.minY, board.maxZ, [board.maxX - board.minX, board.maxY - board.minY, 1]))

*/
