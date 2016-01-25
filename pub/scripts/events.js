"use strict";

function event_handlers() {
	$('canvas').on('mousemove', function(e) {
		if (!e.ctrlKey) {
			player.mouse.x = e.pageX - $(e.target).offset().left;
			player.mouse.y = e.pageY - $(e.target).offset().top;
		} else {
			player.mouse.x = canvas.width / 2;
			player.mouse.y = canvas.height / 2;
		}
	}).on('mouseleave', function(event) {
		player.mouse.x = canvas.width / 2;
		player.mouse.y = canvas.height / 2;
	});
	window.onresize = canvas.adjust
	window.onbeforeunload = unloadPage;
	window.oncontextmenu = abort;

	window.onkeydown = function(e) {
		if (e.which == 27) editor.toggle();

		if ($('input:focus').length > 0) {
			editor.unsaved = true;
			return;
		}

		if (e.ctrlKey || e.altKey) {
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
		}

		if (editor.on) {
			switch (e.which) {
				case 37: // left arrow
					editor.prev();
					break;
				case 39: // right arrow
					editor.next();
					break;
			}
		}
	};
	window.onkeyup = function(e) {
		if ($('input:focus').length > 0) return;
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
		}
	};
	$('body').bind('mousewheel', player.camera.zoom);

	$("a.button, button").on('click', function() { //trigers change in all input fields including text type
		editor.unsaved = true;
	});
}

function unloadPage() {
	if (editor.unsaved) {
		return "You have unsaved changes on this page.";
	}
}