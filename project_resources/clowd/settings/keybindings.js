//setup key bindings


//if you want to register many events against the same element, do it this way - then there's only one call to the function
keyboard.register({
	element: 'document',
	bindings: {
		'CTRL+C': function() {
			console.log('key register copy');
		}
	}
});