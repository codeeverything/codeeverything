Syntax.prototype.TXT = function(source, line) {
	//TAB HACK!
	if(source == undefined) return;
	
	//console.log('text passed: '+source);
	source = source.replace(/\t/g, '    ');
	
	this.styles = {
	'text':'#111111'
	};

	this.addRegion(this.styles['text'], {spos:0, epos: source.length-1});
}