var keyboard = (function() {
	var modifiers = {
		'CTRL':true,
		'ALT':true,
		'SHIFT':true
	}
	
	var keys = {
		127: 'DEL',
		8: 'BACKSPACE'
	}
	
	var registeredEvents = {
	}
	
	var getKeyFromEvent = function(e) {
		var key = [];
		if(e.ctrlKey) key.push('CTRL');
		if(e.altKey) key.push('ALT');
		if(e.shiftKey) key.push('SHIFT');
		
		if(e.keyCode == 8 || e.keyCode == 127) {
		
		} else {
			//normal chars
			key.push(String.fromCharCode(e.keyCode));
		}
		
		return key.join('+');
	}
	
	//when this key combination is fired against the element run the function
	//this should be called during application setup
	//keyboard.register('DEL', 'document', function(e) { self.handleDelBackSpace(e); });
	return {
		register: function(key, element, func) {
			if(typeof key == 'string') {
				if(!registeredEvents[key]) registeredEvents[key] = [];
				registeredEvents[key][element] = func;
			} else {
				//assume object
				var el = key.element;
				for(b in key.bindings) {
					if(!registeredEvents[b]) registeredEvents[b] = [];
					console.log('registering event for key '+b+' on element '+el+ ' function '+key.bindings[b]);
					registeredEvents[b][el] = key.bindings[b];
				}
			}
		},
		parseKey: function(key) {
			key = key.split('+');
			for(k in key) {
				if(modifiers[key[k]]) {
					
				}
			}
		},
		handle: function(e, element) {
			var key = getKeyFromEvent(e);
			//alert(key);
			if(registeredEvents[key][element]) 
				registeredEvents[key][element](e);	//fire the event
			else return false;
			
			//return teh result of the selected function or an error/status code
		}
	}	
})();