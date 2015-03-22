var square_sum = function() {
	var sum = 0;
	for(i=0; i<arguments.length; i++) {
		sum += arguments[i] * arguments[i];
	}
	return sum;
}