var EventHandler = (function(){
	
	//private functions and properties
	var getEventTarget = function(e) {
		var targ;
		if (!e) var e = window.event;
		if (e.target) targ = e.target;
		else if (e.srcElement) targ = e.srcElement;
		if (targ.nodeType == 3) // defeat Safari bug
			targ = targ.parentNode;
			
		return targ;
	}
	
	//return public functions and properties
	return {
		position: function(e) {
			var posx = 0;
			var posy = 0;
			if (!e) var e = window.event;
			if (e.pageX || e.pageY) 	{
				posx = e.pageX;
				posy = e.pageY;
			}
			else if (e.clientX || e.clientY) 	{
				posx = e.clientX + document.body.scrollLeft
					+ document.documentElement.scrollLeft;
				posy = e.clientY + document.body.scrollTop
					+ document.documentElement.scrollTop;
			}
			
			return {x: posx, y: posy};
		},
        button: function(e) { 
		//get the mouse button that was clicked
		//see http://www.quirksmode.org/js/events_properties.html#button for issues with this detection
		var rightclick;
		if (!e) var e = window.event;
		if (e.which) {	//old netscape stuff - not much support but what the hell
			button = e.which;
			return button - 1;	//which gives values 1,2 and 3 (left, middle, right) - we want 0,1,2
		} else if (e.button) {
			button = e.button;
			
			if(Utils.getBrowser() == 'IE') {
				//1, 4, 2
				if(button == 1) return button--;
				if(button == 4) return button - 2;
				else return button++;
			} else {
				//W3C rules
				return button;	//these are 0,1,2 as we want
			}	
		}
        }, 
        key: function(e) { 
        	if (!e) var e = window.event;
		if(e.keyCode) {
			return e.keyCode;
		} else {
			if(!e.which) console.log('Error: Keyboard input had no content in either keyCode or which.');
			return e.which;
		}	
        },
		target: function(e) {
			return getEventTarget(e);
		}, 
		source: function(e) {
			return getEventTarget(e);
		},
		stop: function(e) {
			//kill off the events default behaviour and propagation
			e.preventDefault();
			e.stopPropagation();
		},
		pd: function(e) {
			e.preventDefault();
		},
		sp: function(e) {
			e.stopPropagation();
		}
	}
})();

console.log(EventHandler);