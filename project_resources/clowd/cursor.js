function cursor(pos, editor) {	//cursors should be by document, do this editor should be document?
	//VARIABLES
	
	//private variables
	var context = editor.getContext();	//if cursors are by document then to get this would be: document.editor.getContext()
	var editor = editor;
	var width = 2;	//width the cursor in pixels
	var blinkDelay = 500;	//time in milliseconds to wait between cursor blinks
	var color = '#000';	//the color of the cursor when it's "on"
	var self = this;
	
	//public variables
	this.pos = pos ? pos:{x:0, y:0};
	//this.monoCharWidth = context.measureText('m').width;
	//this.color = '#06ACC2';	//the color of the cursor when it's "on"
	this.cursorOn = true;	//whether the cursor is blinked on, or off
	this.cursorBlinkTimer = null;
	
	/*
	we might want to know what caused this cursor update to happen
	for example, this may be useful when working out code completion tips 
	i.e. whether we should check for being within a method definition or remove the tip
	*/
	this.cursorEventFiredBy = "mouse"||"keyboard";
	
	
	// METHODS
	
	this.blink = function () {
	    //render the cursor
	    //console.log('blinking the cursor');
	    //console.log(editor.getOption('cursorColor'));
	    //console.log(offset);
	    
	    this.stop();
	    
	    //TODO: This IF we causing a bug where the cursor wouldn't render if had an offset. Removing this works fine, but seems dirty. I think the logic probably needs to change for this to be a proper fix
	    //if(this.pos.x > editor.getOffset() && this.pos.y < editor.getOffset()+45) {
		    if(this.cursorOn) {
			context.fillStyle = editor.getOption('cursorColor') ? editor.getOption('cursorColor'):color;
		    } else {
		    	context.fillStyle = editor.getOption('currentLineHighlight');	//get the color of the current line from the editors config
		    }
		    context.fillRect((this.pos.x)*editor.getCharWidth(), editor.getLineHeight()*(this.pos.y-editor.getOffset()), width, editor.getLineHeight());
	    //}
	    
	    this.cursorOn = !this.cursorOn;
	    
	    this.cursorBlinkTimer = setInterval(function() {
	    	self.blink();
	    }, blinkDelay);
	    
	    //document.getElementById('codehint').style.left = document.getElementById('canvas').offsetLeft + (this.pos.x-1)*editor.getCharWidth() + 'px';
	    //document.getElementById('codehint').style.top = 5+document.getElementById('canvas').offsetLeft + editor.getLineHeight()*(this.pos.y-editor.getOffset()+1) + 'px';
	}
	
	this.stop = function() {
		clearInterval(this.cursorBlinkTimer);
	}

	this.advance = function() {
		var line = editor.getCurrentDoc().getLine(this.pos.y);	//get the text of the current line for the open document
		
		var advancedCursor = this.pos.x + 1;
		if(advancedCursor > line.length) {
			this.pos.x = 0;	//move to the start of the line
			this.pos.y++;	//move to the next line down
		} else {
			this.pos.x = advancedCursor;
		}
	}
	
	this.retreat = function(line) {
		var retreatedCursor = this.pos.x - 1;
		if(retreatedCursor < 0) {
			if((this.pos.y - 1) < 0) {
				//if going back anymore would take us past the 0,0 point, just set pos to that and return
				this.pos = {x: 0, y: 0};
				return;	
			}
			
			var line = editor.getCurrentDoc().getLine(this.pos.y - 1);	//get the text of the previous line for the open document
			this.pos.x = line.length;	//move to the end of the line
			this.pos.y--;	//move to the next line down
		} else {
			this.pos.x = retreatedCursor;	//just move back a char on the same line
		}
	}
	
	this.liftCursor = function() {
		var liftedLine = this.pos.y - 1;	//confusingly a lift is an upwards motion, which takes us down in line number
		if(liftedLine < 0) {
			liftedLine = 0;	//adjust for going up too far
			return;
		}
		
		var line = editor.getCurrentDoc().getLine(liftedLine);	//get the previous line in teh document
		if(this.pos.x > line.length) this.pos.x = line.length;	//if our current x pos is > than the line lenght adjust it
		
		this.pos.y = liftedLine;	//move up a line
		
		//TODO: need checks in here to see if we've gone outside of the current viewing window (offset)
		//if so we need to adjust the offset so we can see the lines and render them
	}
	
	this.dropCursor = function() {
		var droppedLine = this.pos.y + 1;	//confusingly a lift is an upwards motion, which takes us down in line number
		if(droppedLine > editor.getCurrentDoc().getLines().length) {
			droppedLine = editor.getCurrentDoc().getLines().length;	//adjust for going down too far (ugly)
			return;
		}
		
		var line = editor.getCurrentDoc().getLine(droppedLine);	//get the previous line in teh document
		if(this.pos.x > line.length) this.pos.x = line.length;	//if our current x pos is > than the line lenght adjust it
		
		this.pos.y = droppedLine;	//move up a line
		
		//TODO: need checks in here to see if we've gone outside of the current viewing window (offset)
		//if so we need to adjust the offset so we can see the lines and render them
	}
	
	//the start of a line
	this.goHome = function() {
		//alert('going home on line '+this.pos.y);
		this.pos.x = 1;
		this.cursorOn = true;
	}
	
	//the end of a line
	this.goEnd = function() {
		//alert(this.pos.y);
		//console.log(editor);
		var line = editor.getCurrentDoc().getLine(this.pos.y);
		this.pos.x = line.length;
	}
	
	//??
	this.resetCursor = function() {
		var line = chLine+1;
	    	context.fillRect(cursorPos[0], 18*(line+1), 1, 18);
		cursorPos = [70, 18*(line+1)];
	}
	
	this.getCursor = function() {
		return this.pos;
	}
	
	this.setCursor = function(pos) {
		//this for in allows for flexible changes to only some of the properties
		//TODO: Validation
		for(p in pos) {
			this.pos[p] = pos[p];
		}
		
		//this.pos = pos;
	}
	
	this.draw = function() {
		//pass in context?
		//in some way clear the existing cursor
		context.clearRect(this.pos.x, this.pos.y, 1, 18);
    		if(this.pos.x > offset && this.pos.y < offset+45) {
			    if(this.cursorOn) {
				context.fillStyle = '#06ACC2';
			    } else {
			    	context.fillStyle = '#FFFFFF';
			    }
			    context.fillRect((this.pos.x)*this.monoCharWidth, 18*this.pos.y, 2, 18);
		    }
	}
	
	//clear the existing cursor...?
	//might be useful if doing a blinking cursor
	//call draw, wait, call clear, wait, repeat
	this.clear = function() {
		context.clearRect(this.pos.x, this.pos.y, 1, 18);
	}

}