
function Document(editor) {
	//i'd include public vars here, but i don't really know why you would have any....

	//console.log(this);
	this.setup(editor);	//just setup our object
	this.cursor = new cursor(null, editor);	//each document has it's own cursor
	this.selection = new textSelection();
	this.name = '';
	this.lines = [];
	this.length = 0;	//the number of lines in the document, to save doing a lines.length
}


//this is going to get executed immediately, before any object is instantiated, so we need to include a setup function (called by the constructor upon instantiation)
(function() {
	// VARIABLES 
	
	//private variables
	var self = this;	//we set this up so that our private methods can access public functions and variables within this class (good for internal functions)
	var editor = '';	//private var
	var clipboard = [];	//a big old array of copied text. Push this back to the server at intervals to make it "infinite"
	var offset = {x: 0, y: 0};	//I think we need offset against a document to retain position when viewing multiple files
	var edits = [];	//I guess edits are made on a per document basis as well
	//edits should contain details on the number of edits aggregated into the posted/stored edit. We can then interrogate the document to see how many edits it took to create 
	//and further break this down into edit types like inserts, deletions, copies, pastes, moves etc
	var editsPosition = -1;	//an undo/redo pointer to show what actions to take next on an undo/redo
	var editingUsers = {};	//users who have some sort of handle on this document
	//the width of a givin char. because we use mono-spaced fonts (for now) each char will be this width
        //var charWidth = context.measureText('m').width;
        //var tabWidth = charWidth * this.tabSize;
        
	var syntaxParserIdent = '';	//generally the editor will pick a parser based on the documents extension, but we may want to use something else
	
	//a selection of stats about the document. provides some interesting info and a handy "static" reference for things like the number of lines, which is used a lot
	var statistics = {
		lines: 0,	//number of lines
		variables: 0,	//number of variables declared
		functions: 0,	//number of functions
		size: 0	//size (in bytes... ish)
	};
	
	//public variables
	
	
	
	// METHODS
	
	//basically our constructor
	this.setup = function(e) {
		editor = e;
	}
	
	//a helper function to make sure the edits we hold in memory never get's too long a list
	var tidyEdits = function() {
	
	}
	
	this.getEdits = function() {
		return edits;
	}
	
	
	this.addEdit = function(type, details) {
		var latestEdit = edits[edits.length-1];
		
		//if the last edit was the same type as this one then append it
		if(latestEdit && latestEdit.type == type) {
			latestEdit.details.ch += details.ch;
			latestEdit.count++;
		} else {
			//add a new edit entry
			var newEdit = {
				type: type, 
				count: 1,
				startTime: 0,	// new Date().getTime()?	
				details: details
			};
			
			edits.push(newEdit);
			
			editsPosition++;	//increment our edits pointer to this new entry (only if a new entry, rather than appending an existing one
		}
				
		//if our edit list is getting too big then push those X items around the "window" of edits back to the server
		
		//if it's getting to small then request a window of edits from the server to keep things going (some sort of ident so we know there are no more previous edits (undos) or new edits (redos) to be had
		//from the server would be a good way to save any further uneccesary requests in the current direction
		
		//possible use the "tidyEdits()" function for this purpose
		document.getElementById('edits').innerHTML = "EDITS POS: "+editsPosition+"<br/><br/>"+dump(edits);	//writing this out was becoming a performance drag
		//console.log(edits);
	}
	
	this.undo = function() {
		//privateMethod();
		//console.log(this);
		if(editsPosition < 0) return;
		
		this.reverseEdit(edits[editsPosition]);	//whatever the edit was, we'll reverse it's action
		
		editsPosition--;	//move back to the previous edit, if any		
	}
	
	this.redo = function() {
		if(editsPosition == edits.length) return;	//to save redoing the last entry multiple times
		
		//valid action to do
		this.forwardEdit(edits[editsPosition]);	//a redo is just the action contained in the edit
		
		editsPosition++;	//move forward to the next edit, if any
		if(editsPosition >= edits.length) {
			editsPosition = edits.length - 1;
			return;	//no more redos	
		}
	}
	
	this.reverseEdit = function(edit) {
		//test - as an experiment, move the cursor to the edit position
		var pos = {x: edit.details.x, y: edit.details.y};
		this.cursor.setCursor(pos);
		document.getElementById('edits').innerHTML = "EDITS POS: "+editsPosition+"<br/><br/>"+dump(edits);

		//console.log(self);
		//return;

		switch(edit.type) {
			case 'insert':
				//poss ought to check the edit has all the components we need
				this.updateLine(edit.details.y, this.deleteChar(edit.details.x, edit.details.ch.length, this.getLine(edit.details.y)));	//something like that
				break;
			case 'delete':
				//this.insertChar();
				this.updateLine(edit.details.y, this.insertChar(edit.details.ch, edit.details.x, this.getLine(edit.details.y)));	//something like that
				break;
			case 'enter':
				break;
			case 'stopchar':
				break; 
			default:
				break;
		}
	}
	
	this.forwardEdit = function(edit) {
		switch(edit.type) {
			case 'insert':
				//poss ought to check the edit has all the components we need
				this.updateLine(edit.details.y, this.insertChar(edit.details.ch, edit.details.x, this.getLine(edit.details.y)));	//something like that
				break;
			case 'delete':
				//this.deleteChar();
				break;
			case 'enter':
				break;
			case 'stopchar':
				break; 
			default:
				break;
		}
	}
	
	//get some more edits from the server
	this.getEditsFromServer = function() {
	
	}
	
	//push our local edits to the server for storage
	this.pushEditsToServer = function() {
	
	}
	
	this.getTotalEditTime = function() {
		return edits[edits.length-1].details.startTime - edits[0].details.startTime;
	}
	
	this.getStatistics = function(stat) {
		if(!stat) return statistics;
		else return statistics[stat];
	}
	
	//update statistics. because most are numeric an increment and decrement functions may suffice
	var updateStatistics = function(stat, val) {
		if(!stat) return false;
		
		statistics[stat] = val;
	}
	
	var incrementStatistic = function(stat) {
	
	}
	
	var decrementStatistic = function(stat) {
	
	}
	
	this.loadDocument = function(fileString, fname) {
		//alert(fileString);
		var lines = fileString.split("\n");
		var tab = editor.getTab();
		var tabLength = tab.length;
		var tokens = {
			tabs: [],
			addTab: function(line, startPos, size) {
				var tabTemp = [];
				for(var i=startPos; i<(startPos+size)-1; i++) {
					tabTemp.push(i);
				}
				
				if(!this.tabs[line]) this.tabs[line] = [];
				this.tabs[line].push(tabTemp);	//push the array of positions into our array of tabs
			}
		};
		
		var functions = [];
		var totalVars = [];
		//replace a \t with the tab string to get the correct spacing when highlighting text
		for(var i=0;i<lines.length;i++) {
		    /*
		    //a token array
		    if(lines[i].indexOf("\t") != - 1) {
		    	var offset = 0;
		    	var c = 0;
		    	while(c < 100 && lines[i].indexOf("\t", offset) != - 1) {
			    	tokens.addTab(i, lines[i].indexOf("\t", offset), tabLength);
			    	offset = lines[i].indexOf("\t", offset) + 1;
			    	
			    	c++;
			}
		    }
		    */
		    
	            lines[i] = lines[i].replace(/\t/g, tab);	//would it be quicker to run this on the fileString before splitting?
	            lines[i] = lines[i].replace(/([\r\n])+/g, ' ');	//TODO: Trying to fix the \n at end of line error. All I'm doing is replacing it with a space. Think a consolodation of the cursor and document models is what we really need
	            if(lines[i].match(/var\s([a-zA-Z0-9])+((\s)*\=(\s)*(function|[^;]+)|;)+/g)) {
	            	var matches = lines[i].match(/var\s([a-zA-Z0-9])+((\s)*\=(\s)*(function|[^;]+)|;)+/g);
	            	
	            	$.each(matches, function(i, v) {
	            		if(v.indexOf('function') != -1) functions.push(v);
	            		else totalVars.push(v);
	            	});

	            }
	        }
	        
	        //console.log(lines);
	        
	        
	        console.log('Found '+totalVars.length+' variable declarations, '+functions.length+' of which were anonymous functions');
	        
	        console.log("tokens: \n"+tokens.tabs);
	        document.getElementById('edits').style.width = "200px";
	        document.getElementById('edits').innerHTML = dump(tokens.tabs);
	        
	        var funcs = '';
	        var rand = Math.floor(Math.random()*11);
	        $.each(functions, function(i, v) {
	        	v = v.replace('var ', '');
	        	v = v.replace(' = function', '');
	        	funcs += "<div class=\""+(i == rand ? 'selectedFunction':'function')+"\">&nbsp;"+v+"</div>";
	        });
	        
	        document.getElementById('edits').innerHTML = funcs;
	        
	        
	        this.lines = lines;	//move the local var lines to the class var
	        this.name = fname;
	        
	        /*
	        //setup the cursor
	        var savedCursor = getSavedCursorForFile(file);	//either  the last position of the cursor if one existed, or 0,0
	        this.cursor.setCursor(savedCursor);
	        //setup the offset
	        editor.setOffset(savedCursor.y);	//TODO: Does a document need to have an offset? Otherwise going between documents would retain the editor.offset and take you to the wrong position?
	        //load the saved selection
	        this.selection = getSavedSelectionForFile(file);
	        */
	        
		//console.log(this.lines);
	}
	
	
	this.saveDocument = function() {
		//save the file details
		var fileMetaData = {
			cursor: this.cursor.pos,
			selection: this.selection
		}
		
		return fileMetaData;
	}
	
	//get the text for the specified line
	this.getLine = function(line) {
		return this.lines[line];
	}
	
	//return the full text of the document (in an array)
	this.getLines = function() {
		return this.lines;
	}
	
	this.splitLine = function(line, pos) {
		var tabOffset = '';
		//var tabOffsetCount = 0;
		
		//adjust pos to be one less, to deal with the difference between the character position on the canvas and in the document model
        	pos--;	//TODO: This doesn't sit well, there must be something better that can be done to bring the cursor and document models in line?
        	
		var text = this.getLine(line);
			
		//try {
			
//			if(text.match(/^(\s)*/) !== null && text.match(/^(\s)*/).length > 0) {
//				console.log(text.match(/^\s+/)[0].length);
//				tabOffset = text.match(/^\s*/)[0];
//
			    //tabOffset = tabOffset + ' ';	//TODO: This is a hack to try and make the \n at the end of a line error better. Needs more thought
//			}
			
		//} catch(e) {}
		
		
		var linePortion = ' ';
		if(pos + 1 != text.length) {
			this.updateLine(line, text.substring(0, pos)+' ');	//we only really need to update the line if we weren't right at the end of it
			linePortion = text.substring(pos);
		}
		
		this.addLine(line+1, tabOffset+linePortion);
		return;
	}
	
	this.addLine = function(pos, line) {
		lines.splice(pos, 0, line);	//ERR: a lot of quick updates to this variable balls it right up...
	}
	
	this.joinLines = function(line) {
		this.lines[line] = this.lines[line]+this.lines[line+1];
		deleteLines(line+1, 1);
	}
	
	//removes a character (or string of length len) from the string at the given position
	this.deleteChar = function(pos, len, str) {
		//adjust pos to be one less, to deal with the difference between the character position on the canvas and in the document model
        	pos--;	//TODO: This doesn't sit well, there must be something better that can be done to bring the cursor and document models in line?
	        var strA = str.split('');
	        strA.splice(pos, len);
	        //console.log(strA);
	        var r =  strA.join('');
	        
	        //console.log("modded line: "+r);
	        
	        return r;
	}
	
	var deleteLines = function(fromPos, howMany) {
		this.lines.splice(fromPos, howMany);
		//this.lines[pos] = 'DELETED';
	}
        
        //adds a character to the string at the given position
        this.insertChar = function(ch, pos, str) {
        	//catch bad strings
        	if(str == undefined || str == '' || !str) return '';
        	
        	//adjust pos to be one less, to deal with the difference between the character position on the canvas and in the document model
        	pos--;	//TODO: This doesn't sit well, there must be something better that can be done to bring the cursor and document models in line?
                              
                var strA = str.split('');
                strA.splice(pos, 0, ch);
                return strA.join('');
        }
        
        this.updateLine = function(line, text) {
        	//console.log('line coming into updateline: '+text);
        	this.lines[line] = text;
        	//alert(this.lines[line]);
        	//alert(this.lines);
        }
                
        
        var joinLine = function(line1, line2) {
                return line1.concat(line2);
        }
        
        this.deleteChunk = function(fixedSelection) {
        	//alert(sel);
        	
        	//fix the selection
        	//var fixedSelection = {};
        	
        	
                //if we're only removing chars from a single line
                //if(lspos == lepos) { lines[spos] = lines[lspos].substring(0, cspos)+lines[spos].substring(cepos); }
                if(fixedSelection.y1 == fixedSelection.y2 || (!fixedSelection.x2 || !fixedSelection.y2)) {	        	
                	this.lines[fixedSelection.y1] = this.lines[fixedSelection.y1].substring(0, fixedSelection.x1-1)+this.lines[fixedSelection.y1].substring(fixedSelection.x2-1);
                } else {
                	var newLine = this.lines[fixedSelection.y1].substring(0, fixedSelection.x1-1)+this.lines[fixedSelection.y2].substring(fixedSelection.x2-1);
                	//alert(newLine);
                	var howManyLines = fixedSelection.y2 - fixedSelection.y1;
                	deleteLines(fixedSelection.y1+1, howManyLines);	//delete a block of lines
                	
                	this.lines[fixedSelection.y1] = newLine;
                }
                
                //otherwise we're removing a selection that spans several lines
                //hmmm
                //remove each full line with a loop calling removeLine
                //for
                //      removeLine(x);
                //loop
                //now join the start and end lines at cspos and epos
                //return lines[lspos].substring(0, cspos)+lines[lepos].substring(cepos);
        }
        
        //insert some text at a given cursor pos
        var insertChunk = function(ins, line, pos) {
                //need to think about inserts that contain line breaks/multiple lines
                lines[line] = lines[line].substring(0, pos)+ins+lines[line].substring(pos);
        }
                
        //remove a whole line at position
        var removeLine = function(pos) {
                lines.splice(pos, 1);
        }
}).call(Document.prototype);	//we call like this to avoid overwriting the prototype object, we just extend it. it's like doing many Document.prototype.method = calls, and we can have private variables