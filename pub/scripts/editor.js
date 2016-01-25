"use strict"

var editor = {
	on: 0,
	unsaved: false,
	width: function() {
		return $('#editor').outerWidth();
	},
	toggle: function() {
		this.on == 1 ? this.close() : this.open();
		canvas.adjust();
	},
	close: function() {
		$('#editor').hide();
		this.on = 0;
	},
	open: function() {
		$('#editor').show();
		this.on = 1;
		if(this.id == null) this.sos(0);
	},

	id: null, // editing element id

	sos: function (id) { // show object stats
		try {
			ob[this.id].selected = 0;
			ob[id].selected = 1;
		} catch (err) {
			console.log(err);
		}


		this.id = id;

		var o = $('div.stats').text('');

		

		// funkcja rekurencyjna przeszukująca cały obiekt:
		this.show_sub_elem(ob[id], o, 0);

		$('h2').text(ob[id].type[0].toUpperCase() + ob[id].type.slice(1) + ' [' + id + ']');

		$('li.lista > span').on('click',function() {
			$(this).parent().find('ul').toggleClass('hidden');
		});
		$('li.lista > ul').addClass('hidden');

		$("li[data-obj='vertices'] > ul").append("<button class='copy'>ADD</button>")
		$("li[data-obj='sides'] > ul").append("<button class='copy'>ADD</button>")
		$('div.stats button.copy').on('click', function() {
			var li = $(this).prev('li').clone().insertBefore($(this));
			var nr = li.prevAll().length;
			li.attr('data-obj', nr);
			li.find('span').eq(0).text(nr);
		});
		var flex_obj = $('[data-obj="pos"], [data-obj="size"], [data-obj="rot"], [data-obj="rotSp"]')
		flex_obj.toggleClass('lista flex').off('click');

		$("[data-obj='selected'], [data-obj='type'], [data-obj='hidden']").hide();
	},


	show_sub_elem: function(obj, dom, deep) {
		if (deep == 4) return;
		var ul = $('<ul>');
		dom.append(ul);
		for (var i in obj) {

			var o = obj[i]; // obiekt podrzędny
			var li = $('<li>').html('<span>' + i + '</span>');
			li.attr('data-obj', i).attr('data-type', typeof i);
			ul.append(li)

			if (typeof o == 'string' || typeof o == 'number' || typeof o == 'boolean') {
				li.append('<input>').find('input').val(o).attr('data-type', typeof o);
			} else if (typeof o == 'object') {
				li.addClass('lista');
				this.show_sub_elem(o, li, deep + 1);
			} else if (typeof o == 'function') {
				li.remove();
			}
		}
	},

	prev: function() {
		this.sos((ob.length + this.id - 1) % ob.length);
	},
	next: function() {
		this.sos((this.id + 1) % ob.length);
	},
	reset: function() {
		this.sos(this.id);
	},
	apply: function() {
		this.apply_changes_to_obj([], $('.stats'))
	},
	remove: function() {
								ob.splice(this.id, 1);
		this.next();
	},
	clone: function() {
		ob.push(JSON.parse(JSON.stringify(ob[this.id])))
		ob[ob.length - 1].rotate = Shape.prototype.rotate;
		this.sos(ob.length - 1);
	},
	export: function() {
		// do dodania

	},

	// funkcja rekurencyjna aktualizująca obiekt
	apply_changes_to_obj: function(arr, li) {
		var that = this;

		if (li.attr('data-type') == 'number')
			arr.push(+li.attr('data-obj'))
		else if (li.attr('data-type') == 'string')
			arr.push(li.attr('data-obj'))

		if (li.find('ul').length != 0) {
			var li2 = li.find('ul').eq(0).children().filter('li');
			$(li2).each(function(index) {
				that.apply_changes_to_obj(arr.slice(), li2.eq(index))
			})
		} else {
			var o = ob[this.id];
			while (arr.length > 1) {
				if (o[arr[0]] == undefined) o[arr[0]] = [];
				o = o[arr.shift()]
			}
			try {
				if (li.find('input').attr('data-type') == 'number')
					o[arr[0]] = +li.find('input').val();
				else
					o[arr[0]] = li.find('input').val();
			}
			catch(err) {
				console.log(o, arr, li.find('input').val());
			}
		}
	},

	check_vertex: function() {
		if (this.on) {
			var v = ob[this.id].vertices;
			for (var i in v) {
				ctx.beginPath();
				ctx.fillStyle = 'red';
				ctx.arc(v[i].screenX, v[i].screenY, 5, 0, 2 * Math.PI, false);
				ctx.fill();
				ctx.closePath();
				ctx.fillText(i, v[i].screenX, v[i].screenY - 10);
			}
		}
	}
}