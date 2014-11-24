var textSelection = function() {};
 
(function() { 
     
    var currentSelection = {};  
        
    return { 
        set: function(coords) {
        	var localSelection = {};
        	
        	//this allows us to specify a limited or full range of coords to change
        	//TODO: Add a check to make sure the values passed in aren't made up coords (like y5) and ignore those that are
        	for(c in coords) {
        		localSelection[c] = coords[c];
        	}
        	
        	currentSelection = localSelection;
        	
        	//fix the selection
        	if(!this.fixSelection()) console.log('Warning: The selection could not be fixed.');        	
        }, 
        get: function() {
        	return currentSelection;
        },
        selectLine: function(line) {},
        selectText: function(pos) {
        	//select the text either side of the cursor
        	//in general this should be a search to find the previous and next non alphanumeric character, but other rules might be worthwhile allowing for
        },
        posWithinSelection: function(pos) {
        	//checks to see if the supplied coords are within the extremes of the current selection
        	//TODO: Incomplete capture of clicking within a selection
		if(editorSelection) {
			if(clickYPos >= editorSelection.y1 && clickYPos <= editorSelection.y2) {
			
				if(clickYPos > editorSelection.y1 && clickYPos < editorSelection.y2) {
					console.log('clicked within the inner part of a selection');
				} else {
				
					if(clickYPos == editorSelection.y1) {
						if(clickXPos >= editorSelection.x1) console.log('clicked within the first line of a selection');
					} else {
						//must be the last line
						
						if(clickXPos <= editorSelection.x2) console.log('clicked within the last line of a selection');
					}
					
				}
			
			}	
		}
        },
        fixSelection: function() {
       		//fix up the selection so that the startPos is before the endPos
		var fixedSelection = {};
		
		var sel = currentSelection;
		
		if(sel.y1 > sel.y2) {
        		var tY = sel.y1;
        		fixedSelection.y1 = sel.y2;
        		fixedSelection.y2 = tY;
        		
        		var tX = sel.x1;
        		fixedSelection.x1 = sel.x2;
        		fixedSelection.x2 = tX;
        	} else if(sel.y1 == sel.y2) {
        		fixedSelection = sel;	//set the same, then overwrite the X values
        		
        		if(sel.x1 > sel.x2) {
	        		var tX = sel.x1;
	        		fixedSelection.x1 = sel.x2;
	        		fixedSelection.x2 = tX;
	        	}
        	} else {
        		fixedSelection = sel;
        	}
        	
        	return fixedSelection;
        }
    } 

}).call(textSelection.prototype);