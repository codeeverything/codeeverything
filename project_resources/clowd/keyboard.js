//handle keyboard interactions

var keyboard = function(editor) {

	this.register = function(el) {
		el.onkeydown = this.keydown;
		el.onkeypress = this.keypress;
	}
	
	//handle ctrl/shift key combos
	var handleSpecialKeyCombos = function(e) {
		var key = e.which;
		var ctrl = e.ctrlKey;
		var shift = e.shiftKey;
		
		if(e.ctrlKey) {
			if(e.which == 67) { editor.copyText(); }
			if(e.which == 88) alert('cut');
			if(e.which == 86) alert('paste');
			
			//return false;
		}
	
		//return true if we actioned something
		//otherwise return false to pass key handling back to keydown
	}
	
	//keydown captures some keys
	this.keydown = function(e) {
		//console.log(e.which);
		
		if(e.shiftKey || e.ctrlKey) {
			if(handleSpecialKeyCombos(e)) return false;
		}
		
		//clear the current selection
		if(!e.shiftKey && !e.ctrlKey) editor.clearSelection();
		
		
		
		
		//page up
		if(e.which == 33) {
			editor.pageUp();
			return false;
		} 
		
		//page down
		if(e.which == 34) {
			editor.pageDown();
			return false;
		} 
		
		//home
		//end
		if(e.which == 36 || e.which == 35) {
		
			if(e.shiftKey) {
				if(e.which == 36) selection = {x1: 0, y1: charPos[1], x2: charPos[0], y2: charPos[1]};
				else selection = {x1: charPos[0], y1: charPos[1], x2: lines[charPos[1]].length, y2: charPos[1]};
			}
			
			//quick jump to the top or bottom of the document
			if(e.ctrlKey) {
				offset = e.which == 36 ? 0:(lines.length - 45);
				charPos = e.which == 36 ? [0,0]:[lines[lines.length-1].length, lines.length];
	                	render(true);
			} else {
				//jump to the start or end of the current line
				charPos[0] = e.which == 36 ? 0:lines[charPos[1]].length;
				dirty[charPos[1]] = true;
				render();
			}
			
			return false;
		}
		
		//insert?
		if(e.which == 45) {
			//set a flag so we know to replace chars when doing an insertChar rather than just insert one
			editor.toggleInsert();
		}
		
		//arrow keys
		
		//not backspace and delete
		if(e.which == 8 || e.which == 46) {
			//make this more robust!
			//if we hit backspace at the beginning of a line join it with the line above
			//also need to check for delete at the end of the line, joining with the line below
			if(charPos[0] <= 0 && e.which == 8) {
				var newX = lines[charPos[1]-1].length;
				lines[charPos[1]-1] = joinLine(lines[charPos[1]-1], lines[charPos[1]]);
				removeLine(charPos[1]);
				
				dirty[charPos[1]-1] = true;
				//this should be a call to updateCursor or something that will redraw the cursor and update the charPos
				charPos = [newX, charPos[1]-1];
			} else {
				if(charPos[0] == lines[charPos[1]].length && e.which == 46) {
					
					if(selection.x2) {
						deleteChunk(selection);
					} else {
				
						var newX = lines[charPos[1]].length;
						lines[charPos[1]] = joinLine(lines[charPos[1]], lines[charPos[1]+1]);
						removeLine(charPos[1]+1);
						
						dirty[charPos[1]] = true;
						charPos = [newX, charPos[1]];
						
					}	
				} else {
					var pos = e.which == 8 ? charPos[0]-1:charPos[0];
					lines[charPos[1]] = deleteChar(pos, lines[charPos[1]]);
					//this should be a call to retreatCursor or something that will redraw the cursor and update the charPos
					if(e.which == 8) charPos[0]--;
				}
			}
			
			dirty[charPos[1]] = true;
			
			render();
			return false;
		}
		
		//tab
		if(e.which == 9) {
			var newX = charPos[0]+4;
			lines[charPos[1]] = insertChar('    ', charPos[0], lines[charPos[1]]);
	
			dirty[charPos[1]] = true;
			//this should be a call to updateCursor or something that will redraw the cursor and update the charPos
			charPos = [newX, charPos[1]];
			
			render();
			return false;
		}
		
		//left and right
		if(e.which == 37 || e.which == 39) {
			
			if(!selection) selection = {x1: charPos[0], x2: charPos[0], y1: charPos[1], y2: charPos[1]};
			
			//update the cursor position
			e.which == 37 ? editor.cursor.retreatCursor():editor.cursor.advanceCursor();
			/*
			//this logic should be in advance and retreat cursor
			if(charPos[0] > lines[charPos[1]].length) {
				charPos[0] = 0;
				charPos[1]++;
			} else if(charPos[0] < 0) {
				charPos[0] = lines[charPos[1]-1].length;
				charPos[1]--;
			}
			
			
			if(e.shiftKey) {
				selection.x2 = charPos[0];
				//console.log(selection);
				dirty[charPos[1]] = true;
			} else {
				clearSelection();
			}
			
			render();
			return false;
			*/
		}
		
		
		//up and down
		if(e.which == 38 || e.which == 40) {
			if(e.shiftKey) {
				charSelection = {x1: selection.x1, x2: selection.x1+1};
				dirty[charPos[1]] = true;
				
			}
			
			//update the cursor position
			e.which == 38 ? editor.cursor.liftCursor():editor.cursor.dropCursor();
			//handle in cursor class
			//if(charPos[0] > lines[charPos[1]].length) charPos[0] = lines[charPos[1]].length;
			
			//render();
			//return false;
		}
		
		
	}
	
	//keypress captures the rest
	this.keypress = function(e) {
		//console.log(e.which);
		//console.log(e);
		if(e.ctrlKey) {
			if(e.which == 26 && e.shiftKey) alert('redo');
			else if(e.which == 26) alert('undo');
			
			return false;
		}
		
		//enter
		if(e.which == 13) {
			editor.splitLine();
		} else {
			//make this more robust!
			lines[charPos[1]] = insertChar(String.fromCharCode(e.which), charPos[0], lines[charPos[1]]);
			
			//this should be a call to advanceCursor or something that will redraw the cursor and update the charPos
			charPos[0]++;
		}
	
		//hacked attempt at scrolling on the X axis when we exceed the size of the canvas
		//needs to scroll back to 0 as well, and take into account any Y offset rather than hardcode 0
		//if(charPos[0] > 20) context.translate(translate - mwidth, 0);
	
		dirty[charPos[1]] = true;
		render();
		return false;
	}
	
}