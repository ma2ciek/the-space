"use strict";

function event_handlers() {
	$('canvas').mousemove(function(e) {
		if (!e.ctrlKey) {
			player.mouse.x = e.pageX - $(e.target).offset().left;
			player.mouse.y = e.pageY - $(e.target).offset().top;
		} else {
			player.mouse.x = canvas.width / 2;
			player.mouse.y = canvas.height / 2;
		}
	});
	$(window).on('beforeunload', function(e) {
		if(editor.opened)
	        return 'You have unsaved stuff. Are you sure to leave?';
	});
	$(window).keydown(function(e) {
		if(e.ctrlKey && e.keyCode == 84) { 
			console.log('aa');
			e.preventDefault();
			return false;
		}
		if(e.ctrlKey || e.altKey) {
			player.mouse.x = canvas.width / 2;
			player.mouse.y = canvas.height / 2;
		}
		switch (e.which) {
			case 9: //tab
				return false;
				break;
			case 87:
				player.straight = 1;
				return false;
				break;
			case 83:
				player.straight = -1;
				return false;
				break;
			case 68:
				player.across = 1;
				return false;
				break;
			case 65:
				player.across = -1;
				return false;
				break;
			case 81: // Q
				break;
			case 69: // E
				break;
			case 192: // tylda
				editor.toggle();
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
			if (player.camera.distance > 4000) player.camera.distance = 4000;
			if (player.camera.distance < 1000) player.camera.distance = 1000;
		}
	})
	$(window).resize(function() {
		canvas.adjust();
	})
}