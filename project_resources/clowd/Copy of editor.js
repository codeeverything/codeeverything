/*
deals with editor interactions. i guess
*/

/*

region thoughts

example code:

function Editor(canvas, options) {
	//console.log(this);
	this.setup(canvas, options);
	console.log(Utils.getBrowser());
	console.log(Utils.getBrowser('OS'));
}

current:
{
0: {
	color1: [regionObj, ... ],
	color2: []
},
1: {
	//as above	
}, .. n
}

new:
{
	color1: {
		0: [x,y,x,y...],
		lineN: []
	},
	colorN {
	}
}

*/

function Editor(canvas, options) {
	//console.log(this);
	this.setup(canvas, options);
	
	console.log(Utils.getBrowser());
	console.log(Utils.getBrowser('OS'));
}

(function() {

	var options;
	var lineContext;
	var lineCanvas;
	var self = this;
	
	var foo = 'don\'t break';
	
	var keyHandledOnKeyDown = false;
	
	this.setup = function(c, opts) {
		canvas = c;
		options = opts;
		
		var defaultOptions = {
			//i don't know exactly what options we might want...
			font: '',
			tabSize: 4,
			showLineNumbers: true,
			autoIndent: false,
			wordWrap: false,
			editInterval: 5,	//how many edits to pile up before pushing them back to the server
			autoSaveInterval: 5000,	//how long to wait until doing a hard save of the whole file
			mscroll: 2,	//how many lines to scroll on mousewheel
			currentLineHighlight: '#E5EECC',	//the background color of the current line (#E5EECC is a nice green)
			canvasColor: '#FFFFFF'
		};
		
		if(!options) options = defaultOptions;
		else {
			//merge default as specified options
			$.each(options, function(opt, val) {
				defaultOptions[opt] = val;
			});
			
			//i'd rather reference options, it's shorter 
			options = defaultOptions;
		}
		
		if(options.style) {
			console.log('style found');
		}
		
		syntax.engine('JS');
		
		
		for(;options.tabSize--;) tab += ' ';
	
		mscrollInc = options.mscroll || 2;	//the number of lines to scroll on mousewheel
		
		
		//setup canvas
		var width = document.body.clientWidth - 200;		//TODO: This should be modified to be less the lineCanvas width, but this will do for now
		var height = document.body.clientHeight;	//TODO: This should be modified to the less the toolbar height, but this will do for now
		canvas.width = width;
		canvas.height = height;
		
		
		
		//canvas cursor
		canvas.style.cursor = 'text';
		
		lineCanvas = document.getElementById('lineCanvas');
		//one of our options is to show/hide line numbers - let's check that here
		if(!options.showLineNumbers) lineCanvas.style.display = 'none';
		//we'll keep the context handy in case they decide to show the lines again
		lineContext = lineCanvas.getContext("2d");
		lineCanvas.height = height;
	
		//set styling
		canvas.style.backgroundColor = options.canvasColor;
		context.textBaseline = "top";
	    	context.font = options.font ? options.font:"11pt monospace";
	    	lineContext.font = context.font;
	    	lineContext.textBaseline = context.textBaseline;
	    	
	    	//clear the canvas to start
	    	context.clearRect(0,0,width,height);
	    	
	    	//figure out our char and line dimensions
	    	mwidth = context.measureText('m').width;
		lineHeight = mwidth*2;
		
		//setup the maximum number of lines visible on the screen
		maxVisibleLines = Math.floor(canvas.height/lineHeight);
		maxXPos = Math.floor(canvas.width/mwidth);
	    
	    	//event handlers
	    	self = this;
	    	canvas.addEventListener('click', function(e) { self.click(e); }, false);
		//canvas.onclick = function(e) { self.click(e); };
		//canvas.addEventListener('doubleclick', function(e) { self.doubleclick(e); }, false);
		canvas.ondblclick = function(e) { self.doubleClick(e); };
		canvas.addEventListener('mousedown', function(e) { self.mousedown(e); }, false);
		//canvas.onmousedown = function(e) { self.mousedown(e); };
		canvas.addEventListener('mouseup', function(e) { self.mouseup(e); }, false);
		//canvas.onmouseup = function(e) { self.mouseup(e); };
		canvas.addEventListener('mousemove', function(e) { self.mousemove(e); }, false);
		//canvas.onmousemove = function(e) { self.mousemove(e); };
		
		//Browser compatibility
		var mousewheelevt=(/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel" //FF doesn't recognize mousewheel as of FF3.x
		canvas.addEventListener(mousewheelevt, function(e) { self.mousewheel(e); return false; }, false)	//TODO: This wont work in IE. But I'm not designing for that right now anyway
		
		canvas.oncontextmenu = function(e) { self.contextmenu(e); return false; };
		
		canvas.addEventListener('dragenter', function(e) {
			console.log('i see you dragging');
			e.preventDefault();
			e.stopPropagation();
		}, false);
		/*
		canvas.ondragenter = function(e) {
			console.log('i see you dragging');
			e.preventDefault();
			e.stopPropagation();
		}*/
		
		canvas.addEventListener('dragover', function(e) {
			console.log('i see you dragging');
			e.preventDefault();
			e.stopPropagation();
		}, false);
		/*
		canvas.ondragover = function(e) {
			e.preventDefault();
			e.stopPropagation();
		}*/
		
		//HTML5 file and other data drag and drop into the browser handling
		canvas.addEventListener('drop', function(e) {
			//TODO: Check the data type that has been dropped
			//If it's not text or a file format we recognise then reject it
			//Otherwise read in the value and do something with it
			//If it's a file then we'll need to display it and possibly add it ot a project or store it on the server
			//If it's text then we might want to paste it at the cursor or add it to the clipboard as the active item
			try {
				e.preventDefault();
				e.stopPropagation();
				console.log(e);
				console.log(e.dataTransfer.types);	//types tells us about the content (if it's text)
				console.log(e.dataTransfer.files);	//files will have something if it's a file and each item has a type property
				//alert(e.dataTransfer.getData('Text'));
				
				document.getElementById('clipboard').value = e.dataTransfer.getData('Text');
			} catch(er) {
				console.log(er);
			}
			
			return false;
		}, false);
		
		document.addEventListener('keydown', function(e) { 
			//console.log(e.srcElement.tagName);
			//if(e.srcElement.tagName == 'BODY') {
				var response = self.keydown.call(self, e);
				//console.log(response);
				if(response === false) keyHandledOnKeyDown = true;	//BROWSER COMPAT: if keydown returns false this is because it's handled the key event and therefore we don't want to do any further processing
				//canvas.focus();
			//}
		}, false);
		
		
		document.addEventListener('keypress', function(e) {
			//if(e.srcElement.tagName == 'BODY') {
				self.keypress.call(self, e);
				//canvas.focus();
			//}
			
		}, false);

		//document.addEventListener('keydown', self.keydown);
		//document.addEventListener('keypress', self.keypress);
		//document.onkeydown = function(e) { self.keydown(e); };	//there is a keyboard class, and moving these handlers to reference that would keep this tidier (could do the same for the mouse?)
		//document.onkeypress = function(e) { self.keypress(e); return false; };
		
		window.onresize = function() {
			var width = document.body.clientWidth-200;
			var height = document.body.clientHeight - 100;
			canvas.width = width;
			canvas.height = height;
			
			lineCanvas.height = height;
			
			//setup the maximum number of lines visible on the screen
			maxVisibleLines = Math.floor(canvas.height/lineHeight);
			maxXPos = Math.floor(canvas.width/mwidth);
			
			//set styling
			context.textBaseline = lineContext.textBaseline = "top";
		    	context.font = lineContext.font = options.font ? options.font:"11pt monospace";
		    	//clear the canvas to start
		    	context.clearRect(0,0,width,height);
		    	lineContext.clearRect(0,0,lineCanvas.width, lineCanvas.height);
		    	
			render(true);
		}
		//alert(canvas.onmousedown);
		
		document.getElementById('forceRender').onclick = function() {
			syntax.clearRegions();
			self.forceRender();
			return false;
		}
		
		document.getElementById('rendermode').onclick = function() {
			renderMode = !renderMode;
			render(true);
			return false;
		}
		
		document.getElementById('closefile').onclick = function() {
			self.closeFile();
			return false;
		}
		
		document.getElementById('newfile').onclick = function() {
			self.newFile();
			return false;
		}
		
		
		document.getElementById('verticalScroll').style.top = canvas.offsetTop;
	        document.getElementById('verticalScroll').style.height = canvas.height;
	        document.getElementById('verticalScroll').onclick = function(e) {
		    	//alert(e.y-canvas.offsetTop);
		    	var clickPos = e.y-canvas.offsetTop;
		    	var linesPerPixel = 1685/parseInt(canvas.height);
		    	
		    	if(linesPerPixel <= 0) linesPerPixel = 1;
		    	
		    	//alert(linesPerPixel*clickPos);
		    	var handleOffset = document.getElementById('verticalScrollHandle').offsetTop;
		    	if(clickPos < handleOffset) {
		    		document.getElementById('verticalScrollHandle').style.top = (handleOffset-50)+"px";
		    	} else {
		    		document.getElementById('verticalScrollHandle').style.top = (handleOffset+50)+"px";
		    	}
	    	
		    	self.setOffset(Math.floor(linesPerPixel*document.getElementById('verticalScrollHandle').offsetTop));
		    	
		    	render(true);
	        }
	        
	        $('.todo').live('click', function() {
		    	var line = $(this).attr('line');
		    	if(line > 0 && line < currentDoc.getLines().length) {
				var newPos = line - Math.floor(maxVisibleLines/2);
				if(newPos < 1) newPos = 0;
				
				currentDoc.cursor.setCursor({x: 1, y: line});
				
				self.setOffset(newPos);
				
				render(true);
			}
		    });
		    
		document.getElementById('toggleComment').onclick = function(e) {
			self.toggleComment();
			
			$('#contextMenu').hide();
			return false;
		}
		    
		//adds a TODO comment at the position clicked
		document.getElementById('addTodo').onclick = function() {
			currentDoc.updateLine(currentDoc.cursor.pos.y, insertChar('//TODO: [Status: Open]  - Mike: '+(new Date().toDateString()), currentDoc.cursor.pos.x));
			
			//update the cursor to be somewhere sensible in the new text
			currentDoc.cursor.setCursor({x: currentDoc.cursor.pos.x+23, y: currentDoc.cursor.pos.y});
			
			dirty[currentDoc.cursor.pos.y] = true;
			render();
			
			$('#contextMenu').hide();	//hide the context menu
				
			return false;
		}
		
		
		//find some text
		document.getElementById('findbutton').onclick = function() {
			findstr(document.getElementById('findinput').value);
			//console.log(find);
			var matches = find.matches;
			var foundMatch = false;
			for(key in matches) {
				//if(key > currentDoc.cursor.pos.y) {
					//alert(key);
					self.setOffset(parseInt(key));	//parseInt is important and the key is a string
					currentDoc.cursor.pos.y = key;
					render(true);
					foundMatch = true;
					break;
				//}
			}
			
			if(!foundMatch) alert('Unable to find any matches');
			
			return false;
		}
		
		document.getElementById('findnextbutton').onclick = function() {
			//findstr(document.getElementById('findinput').value);
			//console.log(find);
			var matches = find.matches;
			var foundMatch = false;
			for(key in matches) {
				if(key > currentDoc.cursor.pos.y) {
					self.setOffset(parseInt(key));	//parseInt is important and the key is a string
					currentDoc.cursor.pos.y = key;
					render(true);
					foundMatch = true;
					break;
				}
			}
			
			if(!foundMatch) alert('Unable to find any more matches');
			return false;
		}
		
		document.getElementById('findprevbutton').onclick = function() {
			//findstr(document.getElementById('findinput').value);
			//console.log(find);
			var matches = find.matches;
			var foundMatch = false;
			for(key in matches) {
				if(key < currentDoc.cursor.pos.y) {
					self.setOffset(parseInt(key));	//parseInt is important and the key is a string
					currentDoc.cursor.pos.y = key;
					render(true);
					foundMatch = true;
					break;
				}
			}
			
			if(!foundMatch) alert('Unable to find any more matches');
			return false;
		}
		
		
		$('.tab').live('click', function() {
			//alert($(this).attr('index'));	
			self.focusFile($(this).attr('index'));
			
			$('.tab').removeClass('tabSelected');
			$(this).addClass('tabSelected');
		});
		
		$('.circle').live('click', function() {
			self.closeFile($(this).attr('index'));	
		});
		
		document.getElementById('closefindreplace').onclick = function() {
			document.getElementById('findreplace').style.display = 'none';
		}
		
		document.getElementById('contextcopy').onclick = function(e) {
			copyText();
			EventHandler.stop(e);
			$('#contextMenu').hide();
		}
		
		/*
		var div = document.createElement('div');
		div.id = 'codehint';
		div.innerHTML = 'functionHint(arg, arg2)';
		div.style.position = 'absolute';
		div.style.top = '0px';
		div.style.left = '0px';
		div.style.zindex = 1900;
		div.style.backgroundColor = 'lightyellow';
		div.style.padding = '2px';
		div.style.font = '11pt monospace';
		
		document.body.appendChild(div);
		*/
	}
	
	//var render = new Render();	
	//var cursor = new Cursor();	//per document?
	//var keyboard = new keyboard();
	//keyboard.register(canvas);	//capture keyboard input
	var test;
	//the options we use should be a mix of these default options and those passed in
	//where if an option is passed in it will override the default one
	
	
	//var canvas = document.getElementById(canvas);
	var context = canvas.getContext("2d");
	var documents = [];	//an array of document objects for the opened docs
	var currentDocumentIndex = 0;
	var currentDoc = null;
	var editorSelection = false;	//the selection (this needs to be per doc)
	var dirty = {};
	var offset = 0;
	var xoffset = 0;	//handle moving left and right
	var maxXPos = 100;	//how many columns the page has
	//var lines = [];	//may make this an array of objects {text: '', indent: X, dirty: true}, or something
	//var cursorPos = [0,0];
	//var charPos = [0,0];
	
	
	//this will be set in some class var
	var mwidth = 0;
	var lineHeight = 0;
	var gotoLine = 0;
	var cachedRegions = [];
	var renderMode = true;
	var insertOn = false;
	var maxVisibleLines = 0; 
	
	var mousedown = false;
	var charPos = [];
	
	//an array of characters/inputs that will trigger an undo item to be created
	//might include stopChars for the current language, and perhaps a timed trigger
	//perhaps as people type we'll store each action in a stack and then when an action doesn't match the ones before we "flush"
	//the stack into an undo item
	//we would also do this when a trigger was reached
	var undoTriggers = [];
	
	var translate = 0;	//the X offset of the canvas
	
	//setup the tab size. per project (so it probably wont live here in the end, but in a Project class, or something)
	var tab = '';
	
	var mscrollInc = 0;	//the number of lines to scroll on mousewheel

	var withinHintableArea = function() {
		//check whether the cursor is within a hintable area of text, if it is find a code hint and display it
		var line = currentDoc.getLine(currentDoc.cursor.pos.y);
		/*
		hintable areas will differ per language, but for a start lets look at JS
		
		a hintable area will run from a period to either a stop char (if the text after the period is a property), or to the next matching (to account for closures) close brace after the period (if it is a function)
		
		console.log(foo.length);
		console.log(foo.length+'px');
		var f = foo.length;
		var f = foo.length + 12;
		
		foo.method(arg, arg)
		foo.method(arg, function() {
			//closure
		});
		*/
	}

	var checkBraces = function() {
		return true;
		
		var pos = currentDoc.cursor.pos;
		var line = currentDoc.getLine(pos.y);
		console.log('character behind the cursor onclick = '+line.charAt(pos.x-2));
		
		var theChar = line.charAt(pos.x-2);
		
		if(theChar == '{') {
			var match = findMatchingBrace(theChar, pos, 0);
			console.log(match);
		} else if(theChar == '}') {
			var match = findMatchingBrace(theChar, pos, 0);
			console.log(match);
		}
	}
	
	var findMatchingBrace = function(brace, pos, direction) {
		var line = currentDoc.getLine(pos.y);
		
		var searchBrace = brace == '{' ? '}':'{';
		
		var matchPos = 0;
		
		if(brace == '{') {
			//an open brace, a close brace must be after this
			if(line.indexOf(searchBrace, pos.x) != -1) {
				matchPos = line.indexOf(searchBrace, pos.x);
				return {x: matchPos, y: pos.y};
			} else {
				//search each subsequent line
				for(var i=pos.y+1; i<= currentDoc.getLines().length; i++) {	
					var line = currentDoc.getLine(i);
					if(line.indexOf(searchBrace) != -1) {
						matchPos = line.indexOf(searchBrace);
						return {x: matchPos, y: i};
					
					}
				}
				
				return false;
			}
		} else {
			//a close brace, a matching open brace must be before this
			if(matchPos = line.lastIndexOf(searchBrace, pos.x) != -1) {
			
			}
		}
	}
	
	//public functions
	
	this.getOptions = function() {
		//console.log(options);
		return options;
	}
	
	//handy utilities
	this.utils = {
		pointsToPixels: function(pointSize) {
			//PT to PX: text size in pt * pixels per inch / points per inch = text size in pixels 
			//Example: 12pt * 96ppi / 72ppi = 16px, from PXtoEM.com
			
			//might be useful in trying to figure out the line height for a given font size
			return pointSize * 96 / 72;	
		},
		getOS: function() {
			//return the current OS
		},
		getBrowser: function() {
			//return the browser
		}
	}
	
	this.toggleComment = function() {
		if(editorSelection.y1 == editorSelection.y2) {
			currentDoc.updateLine(editorSelection.y1, insertChar('//', 1));
		} else {
			var fixedSelection = fixSelection(editorSelection);
			for(var i=fixedSelection.y1; i<fixedSelection.y2; i++) {
				currentDoc.updateLine(i, insertChar('//', 1));
			}
		}
		
		clearSelection();
		render(true);
	}
	
	//get the next or previous stop char position, given the current language and move the cursor there
	var getStopCharPosition = function(pos, direction) {
		var newPos = currentDoc.getNextStopCharPosition(pos);
		currentDoc.cursor.setCursor(newPos);
	}
	
	//a reusable function to get the document position of the passed event (usually a mouse click)
	var getGridPos = function(e) {
		
		//browser compatibility fixes
		var pos = EventHandler.position(e);
		
		e.x = pos.x;
		e.y = pos.y;
		
		
		var clickYPos = 0;
		clickYPos = Math.floor((e.y-canvas.offsetTop)/lineHeight);
		if(clickYPos < 0) clickYPos = 0;    //fix if we're under 0 for some reason

		clickYPos += offset;
		
		var clickXPos = 0;
		clickXPos = (Math.floor((e.x-canvas.offsetLeft)/mwidth));
		
		var line = currentDoc.getLine(clickYPos);
		var lineLen = line.length;
		if(clickXPos > lineLen) clickXPos = lineLen;	//this works for documents that are loaded, but for the inital document it doesnt? very odd
		
		return {x: clickXPos, y: clickYPos};
	}
	
	//a new revised selection object?
	var newSelection = {
		startPos: {x: 0, y: 0},
		endPos: {x: 0, y: 0},
		setStartPos: function(pos) {
			if(!pos.x || !pos.y) return false;
			startPos = pos;
		},
		setEndPos: function(pos) {
			if(!pos.x || !pos.y) return false;
			endPos = pos;
		},
		min: function() {
			//return the minimum of start and end pos
			if(startPos.y < endPos.y) return startPos;
			else return endPos;
		},
		max: function() {
			//max of start and end pos
			if(startPos.y > endPos.y) return startPos;
			else return endPos;
		},
		getFixed: function() {
			//return the "fixed" selection, where startPos < endPos
			var fixedSelection = {};
			var min = this.min();
			var max = this.max();
			
			fixedSelection = {x1: min.x, y1: min.y, x2: max.x, y2: max.y};
			
			return fixedSelection;
		},
		clear: function() {
			//reset or clear the selection, the selection is of size 0
			this.startPos = {x: 0, y: 0};
			this.endPos = {x: 0, y: 0};
		},
		length: function() {
			//for a single line selection return the distance between startPos.x and endPos.x
		}
	}

	//TODO: Implement this, then move into the Document class when selections move there.
	var fixSelection = function(sel) {
		//fix up the selection so that the startPos is before the endPos
		var fixedSelection = {};
		
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
	
	var gotoLine = function() {
		var line = prompt('Which line do you want to go to?');
		
		line--;	//an adjustment as we count from 1, and the lines array counts from 0
		
		if(line > 0 && line < currentDoc.getLines().length) {
			var newPos = line - Math.floor(maxVisibleLines/2);
			if(newPos < 1) newPos = 0;
			
			currentDoc.cursor.setCursor({x: 1, y: line});
			
			self.setOffset(newPos);
			
			render(true);
		} else {
			alert('That doesn\'t make any sense. Are you sure? ;)');	//just for fun
		}
	}
	
	var updateOpenDocumentList = function(index) {
		var docHTML = '';
		$.each(documents, function(i, doc) {
			//alert(i + ' ' + index);
			if(i === index) style = 'tab tabSelected'; else style = 'tab';
			docHTML += '<span class="'+style+'" style="" index="'+i+'">'+doc.name+'&nbsp;&nbsp;<span class="circle" index="'+i+'">&nbsp;x&nbsp;</span></span>';
		});
		
		document.getElementById('openfiles').innerHTML = docHTML;
	}
	
	this.getOption = function(opt) {
		return options[opt];
	}
	
	this.scrollViewInterval = false;
	this.scrollView = function(increment) {
		offset += increment;
		if((offset + 40) >= currentDoc.getLines().length) offset += -increment;
	}
	
	this.getLineHeight = function() {
		return lineHeight;
	}
	
	this.getCharWidth = function() {
		return mwidth;
	}
	
	this.getOffset = function() {
		return offset;
	}
	
	this.changeOffset = function(inc) {
		offset += inc;
		
		//check our offset. if it's before the first line, or after the last then adjust it
		if(offset < 0) offset = 0;
		else if(offset > currentDoc.getLines().length - (maxVisibleLines - 5)) offset = currentDoc.getLines().length - (maxVisibleLines - 5);
	}
	
	this.setOffset = function(pos) {
		offset = pos;
	}
	
	this.getTodos = function() {
		var lines = currentDoc.getLines();
		var len = lines.length;
				
		var todos = [];
		for(var i=0; i<len; i++) {
			if(lines[i].indexOf('//TODO:') != -1) {
				todos.push("<span class=\"todo\" line=\""+i+"\">Line: <b>"+i+"</b>\n"+lines[i].substr(lines[i].indexOf('//TODO:')+7)+"</span>");
			}	
		}
		
		//alert(todos);
		return {count: todos.length, str: todos.join("\n\n")};
	}
	
	this.getCurrentDoc = function() {
		return currentDoc;
	}
	
	this.forceRender = function() {
		render(true);
	}
	
	this.getContext = function() {
		return context;
	}	
	
	
	this.pageUp = function() {
		this.changeOffset(maxLines);
		render();
	}
	
	this.pageDown = function() {
		this.changeOffset(-maxLines);
		render();
	}
	
	//return the tab string
	this.getTab = function() {
		return tab;
	}
	
	var clearSelection = function() {
		//return;	//for now we're not dealing with selections
		
		//a better approach: mark the lines in the selection as dirty!
		var ls = editorSelection.y1, le = editorSelection.y2;	//local variables make this about 3x faster
		for(var i=ls;i<=le;i++) {
			dirty[i] = true;
		}
		
		editorSelection = false;
		//render();	//hopefully anything that calls this function will do it's own rendering...
	}
	
	var getSelectedText = function() {
		//pass in selection?
		//dunno
		
		//no selection
		if(!editorSelection.y2 || !editorSelection.x2) return '';
		
		//fix up the selection, as the y1 coord might not be the lowest (just like rendering)
		var fixedSelection;
		if(editorSelection.y1 > editorSelection.y2) {
			fixedSelection = {x1: editorSelection.x2, y1: editorSelection.y2, x2: editorSelection.x1, y2: editorSelection.y1};
		} else {
			fixedSelection = editorSelection;
		}
		
		//same line selection
		if(fixedSelection.y1 == fixedSelection.y2) return lines[fixedSelection.y1].substring(fixedSelection.x1-1, fixedSelection.x2);
		
		//multi-line
		//treat the first and last lines as a special case
		var firstLine = lines[fixedSelection.y1].substring(fixedSelection.x1-1);
		var lastLine = lines[fixedSelection.y2].substring(0, fixedSelection.x2-1);
		
		var selectedText = '';
		for(var i=fixedSelection.y1+1; i<fixedSelection.y2; i++) {
			selectedText += lines[i]+"\n";
		}
		
		return firstLine+"\n"+selectedText+"\n"+lastLine;
	}
	
	//check out this link for details on copy and paste: http://www.geekpedia.com/tutorial126_Clipboard-cut-copy-and-paste-with-JavaScript.html
	var copyText = function(append) {
		var clipboard = document.getElementById('clipboard');
		var text = getSelectedText();
		
		if(!append) {
			//a straight copy
			clipboard.value = text;
		} else {
			//append to the current copied text
			clipboard.value += text;
		}

		if(text == '') return;
		
		//alert(text);
		
		//if the html element isn't displayed then this wont work. but we don't want it displayed, so set to 0 by 0 and display inline
		clipboard.style.position = 'fixed';
		clipboard.style.bottom = '0px';
		clipboard.style.right = '0px';
		clipboard.style.zindex = 1000;
		clipboard.style.width = '200px';
	        clipboard.style.height = '200px';
	        clipboard.style.display = 'inline';
	        
		clipboard.focus();
		clipboard.select(); 
		
		clipboard.contentEditable = true;

		//introduce a short delay to make sure the text has made it into the element
		setTimeout(function() {
			//document.execCommand("Copy");
			//if(document.selection) {
				//CopiedTxt = clipboard.createTextRange();
				//CopiedTxt.select();
				//CopiedTxt.execCommand("Copy");
			//} else {
			//	console.log('Unable to copy to clipboard');
			//}	
			
			//console.log(document.selection);
		}, 500);
		
		$('#copytext').fadeIn("slow", function() { 
			var self = this;
			setTimeout(function() {
				$(self).fadeOut("slow"); 
			}, 1000);
		});
		
		//TODO: There should be a clipboard element in each document, which is in effect infinitely long (by pushing to the server), which should store each copy done
		//only the most recent (or that pointed to by the pasteCyclePointer) should be popped in the text box for pasting
		
	}
	
	var copyTextAppend = function() {
		copyText(true);
	}
	
	//handle pasting of text
	var cyclePasteBoard = false;
	var cyclePasteBoardTimer = null;
	var pasteText = function(e) {
		//this cycle feature allows you to repeatedly paste from the clipboard, and if done quickly enough, cycle through the available clipboard items inserting them in place of your original paste
		//i figure this might be handy if you want to copy two variables into a block of text or something
		if(cyclePasteBoard) {
			if(!e.shiftKey) {
				console.log('cycling the pasteboard');
			} else {
				console.log('cycling the pasteboard backward');
			}
		} else {
			cyclePasteBoardTimer = null;
			cyclePasteBoard = true;
			cyclePasteBoardTimer = setTimeout(function() {
				cyclePasteBoard = false;
			}, 1000);
		}
		
		
		document.getElementById('clipboard').focus();
		//document.getElementById('clipboard').value = '';
		setTimeout(function() {
		    //if there's a selection removed the text within it
		    var fixedSelection = fixSelection(editorSelection);
		    
		    if(fixedSelection.y2 && fixedSelection.x2)
		    	if(fixedSelection.y1 != fixedSelection.y2 || fixedSelection.x1 != fixedSelection.x2)
		   		deleteChunk(fixedSelection);
		   	
		   console.log(fixedSelection);
		   
		    //update the cursor
		    currentDoc.cursor.setCursor({x: fixedSelection.x1, y: fixedSelection.y1});
		    
		    //get rid of the selection
		    clearSelection();
		    	    
		    var text = document.getElementById('clipboard').value.replace(/\t/g, tab);
		    //var text = 'test test test';
		    //alert(text);
		    
		    var textLines = text.split("\n");
		    
		    //var lines = [];
		    currentDoc.updateLine(currentDoc.cursor.pos.y, insertChar(textLines[0], currentDoc.cursor.pos.x));
		    
		    var pastedOffset = 0;
		    if(textLines.length > 1) {
		        splitLine(currentDoc.cursor.pos.y, currentDoc.cursor.pos.x+textLines[0].length);
		        //lines[charPos[1]] = newLines[0];
		        //addLine(charPos[1]+1, newLines[1]);
		        
		        
		        for(var i=1; i<textLines.length; i++) {
		            currentDoc.addLine(currentDoc.cursor.pos.y+i, textLines[i]);
		            pastedOffset++;
		        }		        
		    } else {
		    	//var i = 1;
		    }
		    
		    //console.log(lines[currentDoc.cursor.pos.y]);
		    
		    //update the cursor to the end of the pasted text
		    var newX = textLines[i-1] ? textLines[i-1].length+1:textLines[0].length;
		    currentDoc.cursor.setCursor({x: currentDoc.cursor.pos.x+newX, y: currentDoc.cursor.pos.y + pastedOffset});
		    
		    //dirty[charPos[1]] = true;
		    render(true);
		}, 50);
		
		$('#pastetext').fadeIn("slow", function() { 
			var self = this;
			setTimeout(function() {
				$(self).fadeOut("slow"); 
			}, 1000);
		});
	}
	
	var cutText = function() {
		//basicaly a copy followed by a deletion
		copyText();
		deleteChunk(editorSelection);
		
		//update the cursor to the end of the pasted text
		var fixedSelection = fixSelection(editorSelection);
		currentDoc.cursor.setCursor({x: fixedSelection.x1, y: fixedSelection.y1});
		
		clearSelection();
		
		render(true);
	}
	
	//takes an object that can be a full selection object or parts of one
	this.updateSelection = function(sel) {
		for(prop in sel) {
			selection[prop] = sel[prop];
		}
	}
	
	//do we need this whole function for this?
	this.toggleInsert = function() {
		insertOn = !insertOn;
	}
	
	//this is in the keydown function. do we need a seperate function for it?
	this.handleTab = function() {
		var cursorPos = this.cursor.getPos();
		var newX = cursorPos.x+tab.length;

		this.documents[currentDoc].updateLines(cursorPos.y, insertChar(tab, cursorPos.x));
		
		dirty[cursorPos.y] = true;
		
		//this should be a call to updateCursor or something that will redraw the cursor and update the charPos
		this.cursor.updateCursor({x: newX});

		render();
		return false;
	}
	
	
	var insertChar = function(ch, pos) {
		pos = pos || this.cursor.x;

		//call the document and update the line with the character at the pos
		//alert(charPos[1]);
		var alteredLine = currentDoc.insertChar(ch, pos, currentDoc.getLines()[currentDoc.cursor.pos.y]);
		//alert(alteredLine);
		currentDoc.updateLine(currentDoc.cursor.pos.y, alteredLine);
		//alert(this.lines);
		//we'll want to make sure that the editors copy of lines is also updated in some way as this is read in the render function to parse the file
		//I suppose that could change and point to the lines in the current document, no real reason why not?...
		
		//other stuff, for example building on the edits list
		
		//do some editor style rendering
		dirty[charPos[1]] = true;
		//render();
		
		return alteredLine;
	}
	
	var deleteChunk = function(sel) {
		currentDoc.deleteChunk(sel);
	}
	
	//removes a character from the string at the given position
	var deleteChar = function(pos, str) {
	        currentDoc.updateLine(currentDoc.cursor.pos.y, currentDoc.deleteChar(pos, 1, str));
	}
	
	//splits a line in two at pos. returns an array of the two lines
	var splitLine = function(line, pos) {
		line = line || currentDoc.cursor.pos.y;
		pos = pos || currentDoc.cursor.pos.x;
		
		currentDoc.splitLine(line, pos);
		//currentDoc.addLine(newLine);
	        //this.cursor.updateCursor({x:0, y:line+1});
	        
	        //we'll need to render every line after this one!
		//well not quite. we need to render every visdible line sfter this one
		//much better!
		//the loop below is not quite right as +45 is the max lines, but there may only be one line after this one
		var maxVisibleLine = offset + maxVisibleLines;
		//alert(currentDoc.cursor.pos.y);
		//alert(maxVisibleLine);
		for(var i=(currentDoc.cursor.pos.y)-1;i<maxVisibleLine;i++) dirty[i] = true;
	        
	        return;
	}
	        
	//create a new blank line at position
	var addLine = function(pos, line) {
	        lines.splice(pos, 0, line);
	}
	
	//remove a whole line at position
	var removeLine = function(pos) {
	        lines.splice(pos, 1);
	}
	
	var joinLine = function(currentLine) {
		currentDoc.joinLines(currentLine);
	}
	
	var previousActivityTimer = false;
	this.mousewheel = function(e) {	
		//console.log('wheels');
		if(!currentDoc) return;	//if there's no document to operate on get out of here!
		
		//In firefox shift and mousewheel takes you through the history. Prevent that behaviour here
		e.preventDefault();
		e.stopPropagation();
		
		console.log(EventHandler.position(e));
		
		var delta=e.detail? e.detail*(-120) : e.wheelDelta; //check for detail first so Opera uses that instead of wheelDelta
        
        	//change our offset to move our view on the document up or down mscrollInc lines
        	var scrollInc = mscrollInc;
        	if(e.shiftKey) {
        		//if you hold shift when scrolling then double the pace at which we move
        		scrollInc *= 2;	
        	}
        	
		if(delta > 0) {
	    		this.changeOffset(-scrollInc);
	    	} else {
	    		this.changeOffset(scrollInc);
	    	}
	    	
	    	//TODO: as part of moving between sites of "previous activity", setup a timeout here so that if we scroll and then stop for more than time X we store the offset as a site of "previous activity"
	    	clearTimeout(previousActivityTimer);  

		previousActivityTimer = setTimeout(function(os) {
	    		console.log('previous activity on line: '+os);
	    	}, 1000, [offset]); 
		
	    	//canvas = null;
	    	//context = null;
	    	render(true);
	        return false;
	}
	
	this.click = function(e) {
		if(!currentDoc) return;	//if there's no document to operate on get out of here!
		
		//console.log(e);
		//most of the mouse interaction is in mousedown and mousemove
		
		//hide the context menu
		$('#contextMenu').hide();    
	}
	
	//double clicking a word should select it. I think the logic is that we look back and forward from the cursor position until we find a non-alphanum character
	this.doubleClick = function(e) {
		//deal with a double click on the canvas - this should select the text before and after the clicked char while the chars are alpha-numeric	
		var clickXPos = clickYPos = 0;
		var gridPos = getGridPos(e);
		clickXPos = gridPos.x;
		clickYPos = gridPos.y;
		
		//helper function to crudely find the position of non alpha num chars in a string from a position
		function search(text, startPos, direction) {
			for(var x=startPos; x >= 0, x <= text.length; x+=direction) {
				if(text.charAt(x).match(/[^a-z0-9]/gi) !== null) {
					break;
				}
			}
			return x;
		}
		
		var line = currentDoc.getLine(clickYPos);
		//a first drag of finding non alpha num characters from the cursor pos
		var firstPos = 	search(line, clickXPos, -1)+2;
		var lastPos = search(line, clickXPos, 1)+1;
		if(lastPos == 0) lastPos = line.length;
		
		editorSelection = {x1: firstPos, y1: clickYPos, x2: lastPos, y2: clickYPos};
		//console.log(editorSelection);
		
		//update the cursor
		var pos = {x: lastPos, y: clickYPos};
		currentDoc.cursor.setCursor(pos);
		
		dirty[clickYPos] = true;
		render();
	}
	
	this.mousedown = function(e) {
		if(!currentDoc) return;	//if there's no document to operate on get out of here!
		if(EventHandler.button(e) == 2) return;	//the right mouse button
		
		mousedown = true;	//a flag to let us know the mouse is currently down

		
		//well. not quite
		//we don't want to clear the editorSelection if we're dragging it elsewhere
		//this catch will need to be in onmousedown
		//if(within(pos, editorSelection) handle dragging the selected text
		
		var gridPos = getGridPos(e);
		clickXPos = gridPos.x;
		clickYPos = gridPos.y;
		
		//alert(clickXPos + ", " + clickYPos);

		currentDoc.cursor.cursorOn = true;
		currentDoc.cursor.setCursor({x:clickXPos, y:clickYPos});
		
		//TODO: Incomplete capture of clicking within a selection
		//Swap for using the textSelection class/object in the document
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
		
		
		//clear the current editorSelection
		if(!e.shiftKey) clearSelection();

		if(e.shiftKey) {
			if(!editorSelection) {
			    //console.log(' no editorSelection');
			    editorSelection = {x1:currentDoc.cursor.pos.x, y1: currentDoc.cursor.pos.y};
			} else {
			    // adding to an existing editorSelection
			    var s = editorSelection;
			    editorSelection = {x1: editorSelection.x1, y1: editorSelection.y1, x2: currentDoc.cursor.pos.x , y2: currentDoc.cursor.pos.y};
			}
			
			//console.log(getSelectedText().split("\n"));
		} else {
			editorSelection = {x1:currentDoc.cursor.pos.x, y1: currentDoc.cursor.pos.y};
		}
		
		//do a check to see if the character before the cursor is a brace
		checkBraces();
		
		currentDoc.cursor.cursorOn = true;
		render(true);	//TODO: full render, really?
	}
	
	this.mouseup = function(e) {
		//console.log('mouseup at '+e.clientX+','+e.clientY);
		mousedown = false;
		//clear any scrolling check interval here
	}
	
	this.mousemove = function(e) {
		if(!currentDoc) return;	//if there's no document to operate on get out of here!
		
		//if we're not holding down the mouse then we don't really want to do anything when the mouse moves
		if(mousedown) {
			var gridPos = getGridPos(e);
			clickXPos = gridPos.x;
			clickYPos = gridPos.y;
			
			//alert(clickXPos + ", " + clickYPos);
			
			//update the cursor
			currentDoc.cursor.cursorOn = true;
			currentDoc.cursor.setCursor({x:clickXPos, y:clickYPos});
			
			//update the end coords of the selection
			editorSelection.x2 = clickXPos;
			if(clickYPos < editorSelection.y2) dirty[clickYPos+1] = true;	//here we're saying that if we've moved back up a line in the selection, then as well as rendering the new selection we'll need to render the line we just excluded from the selection
			if(clickYPos > editorSelection.y2) dirty[clickYPos-1] = true;	//here we're saying that if we've moved back down a line in the selection, then as well as rendering the new selection we'll need to render the line we just excluded from the selection
		        editorSelection.y2 = clickYPos;
		        
		        //rather than do a full refresh we could dirty up only those lines that have been added to/removed from
		        //the editorSelection since the last render.
		        //for example: lastY = editorSelection.y2, if curline > lastY, dirtyp[curline]
		        var fixedSelection = fixSelection(editorSelection);
		        var startLine = fixedSelection.y1;
		        var endLine = fixedSelection.y2;
	
			
			for(var l=startLine; l<=endLine; l++) 
				dirty[l] = true;
				
			//console.log(dirty);
		        
			render();
		        
		        //update the second position of the selection
		        if(editorSelection.y2 < editorSelection.y1) {
		            //console.log('were selecting upwards');
		            //console.log(lines[editorSelection.x1]);
		        }
		        
		        //dragging a selection off the bottom of the viewable area
		        if(clickYPos > (offset+maxVisibleLines)) {
		        	self = this;
		        	//this.scrollViewInterval = setInterval(function() {
		        	//	self.scrollView(2);
		        	//}, 50);
		        	//TODO:
		        	//we need some interval to fire here which will keep updating offset until the mouse moves again (in which case we need to check it's position), or the mouse button is released
		        	//both cases clear the interval and stop the scrolling
		        } else {
		        	//TODO: Don't forget the same but for the top of the viewable area
		        }
		        
		        //console.log(editorSelection);
		        
		        //if we're at the bttom (need top check too), then scroll the text
		        //if(e.clientY/18 >= 45) offset++;
		        //we'll need an interval here which will check if the position is still outside the area
		        //if it is keep scrolling!

		        /*if(editorSelection.y2 < editorSelection.y1) {
		            console.log('were selecting upwards');
		            console.log(lines[editorSelection.x1]);
		
		           
		            var tY = tSelection.y1;
		            var tY2 = tSelection.y2;
		            tSelection.y1 = tY2;
		            tSelection.y2 = tY;
		        }
		        */
		        
		        //some debug output for the current selection
		        var tSelection = editorSelection;
		        document.getElementById('fileDetail').innerHTML = 'x1:'+tSelection.x1+',y1:'+tSelection.y1+',x2:'+tSelection.x2+',y2:'+tSelection.y2;
		}
	}
	
	//NOTE: "THIS" in this context is the DOCUMENT, as it is that which fires the keypress event
	this.keypress = function(e) {
		if(!currentDoc) return;	//if there's no document to operate on get out of here!
		
		var which = EventHandler.key(e);	//TODO: keyCode and which are quite different, and causing issues!
		//if(keyHandledOnKeyDown) { keyHandledOnKeyDown = false; return; }	//for firefox we need to know not to fall into keypress if keydown did something (at the moment at least)
		
		//console.log('KEYPRESS');
		//console.log(which);
		
		//alert('keypress fired');
		
		//Browser consideration: Chrome doesn't seem to fire this if keydown has handled the key, but firefox does, which results in errors. For example if we hit delete/backspace in firefox we get one op to delete the char
		//but then fall in here and call insertChar with the delete/backspace keycode! bad :)
		//possibly need some sort of flag set in keydown to show an action was taken, i.e. the input has been handled and therefore we should just drop out of this
		//or some exclusion of keycodes in this function
		//console.log('charcode: '+which);
		//TODO: Chrome uses e.which, firefox e.keyCode - need to add this to a browser compatibiliy handler
		if(which == 8 || which == 127) return;	//hacked up fix for firefox handling
		
		
		
		//Browser compatibility fixes
		var targ = EventHandler.target(e);	//get the target element of the event, or if you prefer the source of the event (both the same)
		if(targ.tagName != 'BODY' && targ.tagName != 'HTML') return;	//in Chrome teh document.keypress function returns an element of BODY, in FireFox it returns HTML. If it's neither then we're not capturing typing on the canvas
		
		
		currentDoc.cursor.cursorOn = true;	//TODO: I've done this in quite a few places. This should be a function call and cursorOn should be a private property of the cursor class. Not to mention I don't like the constant reference to currentDoc and .cursor...		
		//console.log(which);
		console.log(e);		
		
		//enter
		if(which == 13) {
			//TODO: Since all we're doing is repositioning lines (except for if one is split into two), we can reuse the cachedRegions we have
			//I think at the moment it's having to do a parse on all lines after the current each time you hit enter (so if you hold it down, its sluggish)
			//Adjust the line numbers of the cached regions (same would apply for deleting lines or sections, moving sections/lines etc)
			
			if(editorSelection.x2 || editorSelection.y2) {
				var fixedSelection = fixSelection(editorSelection);
				deleteChunk(fixedSelection);
				for(var x=fixedSelection.y1; x<=fixedSelection.y2; x++) dirty[x] = true;
				
				//update the cursor
				currentDoc.cursor.setCursor({x: fixedSelection.x1, y: fixedSelection.y1});
				clearSelection();
			}
			
			
			//create an edits record for this action
			var edits = currentDoc.getEdits();
			currentDoc.addEdit('enter', {
				ch: '',
				startTime: new Date().getTime(),
				x: currentDoc.cursor.pos.x,
				y: currentDoc.cursor.pos.y				
			});
			
			splitLine(currentDoc.cursor.pos.y, currentDoc.cursor.pos.x);
			
			//console.log(newLines);
			
			//to reposition the cursor we basically do a dropCursor and goHome
			currentDoc.cursor.dropCursor();
			//but the line may be autoindented, so only do a goHome if we don't have a "tab"
			var newLine = currentDoc.getLine(currentDoc.cursor.pos.y);
			//AUTO INDENT the new line
			//TODO: Oddly, disabling this has made auto indenting work...
			if(options.autoIndent) {
				if(!newLine.match(/^\s+/g)) {
					console('went home');
					currentDoc.cursor.goHome();
				} else {
					var spacing = newLine.match(/^\s+/)[0].length;
					var pos = {x:spacing-1, y:currentDoc.cursor.pos.y};
					
					currentDoc.cursor.setCursor(pos);
				}	
			} else {
			
				//TODO: If the cursors X position doesn't move forward then we end up with terrible performance issues...
				var pos = {x:1, y:currentDoc.cursor.pos.y};	
				currentDoc.cursor.setCursor(pos);
			}
			
			
			console.log('marking lines '+(currentDoc.cursor.pos.y-1)+' to '+(Math.abs((offset+maxVisibleLines))));
			
			for(var i=currentDoc.cursor.pos.y-1;i<(offset+maxVisibleLines);i++) dirty[i] = true;	//TODO: Make this better. I got confused...
		} else {
		
			EventHandler.stop(e);
		
			//ANY OTHER KEY! (we expect character/numeric keys (i.e. not action keys as such)
			if(editorSelection.x2 || editorSelection.y2) {
				var fixedSelection = fixSelection(editorSelection);
				deleteChunk(fixedSelection);
				//TODO: Warning, this is hacked up to work to the specific selection on the same line scenario as a start!
			            var pos = {x: fixedSelection.x1, y: fixedSelection.y1};
			            currentDoc.cursor.setCursor(pos);
			            
			            
			            dirty[currentDoc.cursor.pos.y] = true;	//TODO: This'll need a look. As a minimum this will be true, but it could be many more lines
			            for(var i=fixedSelection.y1; i<=maxVisibleLines; i++) dirty[i] = true;
			            
			            //blank the selection
			            clearSelection();
			}
			
			
			//make this more robust!
			console.log(String.fromCharCode(which));
			insertChar(String.fromCharCode(which), currentDoc.cursor.pos.x);

			//build up info on edits that have happened to this document
			var editType = 'insert';
			if(String.fromCharCode(which) == ' ') editType = 'stopchar';
			var edits = currentDoc.getEdits();
			currentDoc.addEdit(editType, {
				ch: String.fromCharCode(which),
				startTime: new Date().getTime(),
				x: currentDoc.cursor.pos.x,
				y: currentDoc.cursor.pos.y				
			});
			
			//this should be a call to advanceCursor or something that will redraw the cursor and update the charPos
			currentDoc.cursor.advance();
			
			//console.log("Document length: "+lines.join('').length);
			
			//If our line is too long to fit on the screen horozontally, then adjust the canvas' centre to move our view to the right (reverse happens for backspace)
			if(currentDoc.cursor.pos.x > maxXPos) {
				context.translate(translate - mwidth, 0);
				render(true);
				xoffset++;
			} else {
				//TODO: need some logic to head back toward 0 as well...
			}
		}

		dirty[currentDoc.cursor.pos.y] = true;
		render();	//TODO: I was wondering if the rendering was what produced the high CPU load. By commenting this out I can see it is. So, we need a better way of rendering after an ENTER keypress
		//Ideas would include: not parsing the syntax of lines that are "dirty" but haven't changed content, only marking lines from the cursor position to the max visible line as dirty
		return false;
	}
	
	//NOTE: "THIS" in this context is the DOCUMENT, as it is that which fires the keydown event
	this.keydown = function(e) {	
		//console.log('KEYDOWN');
		
		
		
		//Reasons not to do anything
		var targ = EventHandler.target(e);	//get the target element of the event, or if you prefer the source of the event (both the same)
		if(targ.tagName != 'BODY' && targ.tagName != 'HTML') return;	//in Chrome teh document.keypress function returns an element of BODY, in FireFox it returns HTML. If it's neither then we're not capturing typing on the canvas
		
		if(!currentDoc) return;	//if there's no document to operate on get out of here!
		
		//TODO: For firefox at least we need something here to prevent default actions, but if we do this in chrome we can't type!
		
		
		//var keyHandled = keyboard.handle(e, 'document');
		//if(keyHandled) return;
		//othyerwise we found no key binding, or the key binding failed
		//treat this as a normal key press (character key) and try to render (could result in some odd output if the handler failed!)
		
		//console.log('keydown this: ');
		//console.log(this);
		
		//console.log(currentDoc.cursor.pos.y);
		//console.log((offset+maxVisibleLines));

		//set the cursor to ON
		currentDoc.cursor.cursorOn = true;
		
		
		var ctrl = e.ctrlKey;
		var shift = e.shiftKey;
		var which = EventHandler.key(e);
		console.log(which);
		
		//reset our view to the cursor. 
		if(which < 16 || which > 18) {	//ignore command keys on their own
			if(currentDoc.cursor.pos.y > (offset+maxVisibleLines) || currentDoc.cursor.pos.y < (offset)) {
				self.setOffset(currentDoc.cursor.pos.y);
				render(true);	//TODO: This handling could very well result in multiple renders. Could we be more clever and limit it to only one?
			}
		}
		
		//clear the current editorSelection
		//if(editorSelection && !e.shiftKey && !e.ctrlKey) clearSelection();	//TODO: steady. this was clearing on a delete key, which is no good if you want to delete a selection (needs more of a think)
		
		if(e.ctrlKey) {
			//copy, cut and paste
			if(which == 67) { 
				EventHandler.stop(e);
				if(shift) {
					//append copy
					//alert('append copy');
					copyTextAppend(); 
				} else {
					//normal copy
					copyText();
				}
				return false;
			} else if(which == 88) { 
				cutText(); 
				render(true); 
				return false;
			} else if(which == 86) { 
				pasteText(e); 
				return false;
			}
			
			if(e.keyCode == 90) {	
				//console.log('Z Undo/Redo');
				if(e.shiftKey) {
					//redo
					currentDoc.redo();
					render(true);		//TODO: Make this something other than a full refresh, just the lines affected		
				} else {
					//undo
					currentDoc.undo();
					render(true);		//TODO: Make this something other than a full refresh, just the lines affected
				}
				
				return false;
			}
			
			//ctrl F
			else if(which == 70) { 
				EventHandler.stop(e);	//prevent normal browser CTRL-F handling
				
				$('#findreplace').show();	//show the find/replace panel
				$('#findinput').focus().select();	//focus the find text element and select it's contents

				return false;
			}
			
			//ctrl G
			else if(which == 71) { 
				e.stopPropagation();	//prevent the normal CTRL-G handling from firing
				gotoLine(); 
			}
			
			//ctrl s - save
			else if(which == 83) { 
				EventHandler.stop(e);
				saveFile(); 
				return false; 
			}
			
			//ctrl q - full canvas refresh for the time being to get past rendering errors
			else if(which == 81) { 
				render(true); 
				return false;
			}
			
			//ctrl a - select all
			else if(which == 65) { 
				editorSelection = {x1:0, x2: lines[lines.length-1].length, y1: 0, y2:lines.length-1};	//set the selection for the whole document
				render(true);	//do a full render
				return false;
			}
		}
		
		
		//page up
		if(which == 33) {
			//probably should update the cursor here as well
			var cPos = currentDoc.cursor.getCursor();
			var newYPos = cPos.y - maxVisibleLines;
			if(newYPos < 0) newYPos = 0;
			cPos.y = newYPos;
			currentDoc.cursor.setCursor(cPos);
			
			//offset-=40;
			self.changeOffset(-maxVisibleLines);
			render(true);
			return false;
		} 
		
		//page down
		if(which == 34) {
			//probably should update the cursor here as well
			//probably should update the cursor here as well
			var cPos = currentDoc.cursor.getCursor();
			var newYPos = cPos.y + maxVisibleLines;
			if(newYPos > currentDoc.getLines().length) newYPos = currentDoc.getLines().length;	//TODO: there's far too many calls to get lines for a length. maybe this should be saved as a doc statistic for easy access?
			cPos.y = newYPos;
			currentDoc.cursor.setCursor(cPos);
			
			//offset+=40;
			self.changeOffset(maxVisibleLines);
			render(true);
			return false;
		} 
		
		//home
		//end
		if(which == 36 || which == 35) {
			if(e.shiftKey) {
			    if(which == 36) editorSelection = {x1: 0, y1: charPos[1], x2: charPos[0], y2: charPos[1]};
			    else editorSelection = {x1: charPos[0], y1: charPos[1], x2: lines[charPos[1]].length, y2: charPos[1]};
			}
			
			//quick jump to the top or bottom of the document
			if(e.ctrlKey) {
			    if(which == 36) {
			    	currentDoc.cursor.setCursor({x: 0, y: 0});
			    	offset = 0;
			    } else {
			    	var numLines = currentDoc.getLines().length -1;
			    	var lastLineLength = currentDoc.getLine(numLines).length;
			    	currentDoc.cursor.setCursor({x: lastLineLength, y: numLines});
			    	
			    	offset = numLines - maxVisibleLines;
			    }

			    render(true);
			} else {
			    //jump to the start or end of the current line

			    //if we had an xoffset, reset it and adjus the canvas
			    if(which == 36) {
			    	currentDoc.cursor.goHome();
			    	context.translate(mwidth * xoffset, 0);
			    	xoffset = 0;
			    } else {
			    	currentDoc.cursor.goEnd();
			    }
			    
			    dirty[currentDoc.cursor.pos.y] = true;
			    render(true);
			}
			
			return false;
		}
		
		//insert?	- should be per document?
		if(which == 45) {
			//set a flag so we know to replace chars when doing an insertChar rather than just insert one
			insertOn = !insertOn;
			return;
		}
		
		//backspace and delete
		if(which == 8 || which == 46) {
			//make this more robust!
			EventHandler.stop(e);
			
			try {
				//build up info on edits that have happened to this document
				currentDoc.addEdit('delete', {
					ch: currentDoc.getLine(currentDoc.cursor.pos.y).charAt(currentDoc.cursor.pos.x-1),
					startTime: new Date().getTime(),
					x: currentDoc.cursor.pos.x,
					y: currentDoc.cursor.pos.y				
				});
				
				var cPos = currentDoc.cursor.getCursor();
				
				//alert(currentDoc.getLine(currentDoc.cursor.pos.y).charAt(currentDoc.cursor.pos.x-2));
				
				
				//if we hit backspace at the beginning of a line join it with the line above
				//also need to check for delete at the end of the line, joining with the line below
				if(cPos.x <= 1 && which == 8) {
				    //alert('backspace at line start');
				    var newX = currentDoc.getLine(cPos.y-1).length+1;
				    joinLine(cPos.y-1);
				    //removeLine(charPos[1]);
				    
				    //reset the cursor position
				    currentDoc.cursor.setCursor({x: newX, y: cPos.y-1});
				    
				    dirty[currentDoc.cursor.pos.y-1] = true;
				    //we'll need to render every line after this one!
				    //well not quite. we need to render every visdible line sfter this one
				    //much better!
				    //alert((offset+maxVisibleLines));
				    for(var i=offset;i<(offset+maxVisibleLines);i++) dirty[i] = true;	//TODO: Make this better. I got confused...
				    //this should be a call to updateCursor or something that will redraw the cursor and update the charPos
				    //charPos = [newX, charPos[1]-1];
				} else {
				    //if the key is delete and we're at the end of the line, then we need to join this with the line below
				    //alert(currentDoc.getLine(currentDoc.cursor.pos.y).length);
				    if((cPos.x == currentDoc.getLine(cPos.y).length || currentDoc.getLine(cPos.y).length == 0) && which == 46) {
				    	//if there is a selection then we're deleting a chunk of text
				        if(editorSelection.x2 || editorSelection.y2) {
				            var fixedSelection = fixSelection(editorSelection);
				            deleteChunk(fixedSelection);
				            
				            
				            //update the cursor to be at the start of the selection
				            console.log(editorSelection);
				            if(fixedSelection.x1 == undefined) fixedSelection.x1 = 1;
				            currentDoc.cursor.setCursor({x: fixedSelection.x1, y: cPos.y});
				            
				            clearSelection();	//now we've completed an action the selection is removed
				            render(true);
				        } else {
				            //otherwise we're deleting a char at a time
				            //var newX = currentDoc.getLine(currentDoc.cursor.pos.y).length;
				            joinLine(cPos.y);
				            
				            dirty[cPos.y] = true;
				            var maxVisibleLine = offset + maxVisibleLines;
					    //alert(currentDoc.cursor.pos.y);
					    //alert(maxVisibleLine);
					    for(var i=(cPos.y);i<maxVisibleLine;i++) dirty[i] = true;
				        }   
				    } else {
				    	//if we have a selection treat that differently to a normal deletion
				    	if(editorSelection.x2 || editorSelection.y2) {	
				    	    //alert('del chunk');
				    	    var fixedSelection = fixSelection(editorSelection);
				            deleteChunk(fixedSelection);
				            
				            //TODO: Warning, this is hacked up to work to the specific selection on the same line scenario as a start!
				            //I think this now works better for selections that are not all on one line
				            var pos = {x: fixedSelection.x1, y: fixedSelection.y1};
				            currentDoc.cursor.setCursor(pos);
				            //blank the selection
				            clearSelection();
				            
				            dirty[currentDoc.cursor.pos.y] = true;	//TODO: This'll need a look. As a minimum this will be true, but it could be many more lines
				            render(true);
				        } else {   
				        	console.log('love it');
					    	//this should be a call to retreatCursor or something that will redraw the cursor and update the charPos
					        if(which == 8) currentDoc.cursor.retreat();
					        //var pos = which == 8 ? currentDoc.cursor.pos.x-1:currentDoc.cursor.pos.x-1;
					        var pos = currentDoc.cursor.pos.x;
					        deleteChar(pos, currentDoc.getLine(currentDoc.cursor.pos.y));
				    	}
				    }
				}
				
				//console.log(charPos[0]);
				
				if(xoffset > 0 && currentDoc.cursor.pos.x < (xoffset)) {
				//if(xScrollOffset > 0 && (charPos[0] - maxXPos) > 0) {
					try {
				        	context.translate(mwidth, 0);
						render(true);
						xScrollOffset--;
					} catch(e) {
						alert(e.description);
					}
				}
				
				dirty[currentDoc.cursor.pos.y] = true;
			} catch(e) {
				alert(e.description);
			}
			
			try {
				render();
			} catch(e) {
				//alert(e.description);
			}
			
			return false;
		}
		
		//tab
		if(which == 9) {
			//e.stopPropagation();
			e.preventDefault();	//got to do this otherwise we'll fire the default behaviour which is to move through the HTML elements on the page
			
			if(e.shiftKey) {
				//a backward tab
				//TODO: Shift-TAB code. This is really hacked together. Works, but probably really bad for many lines. Tidy this up. 
				var newX = currentDoc.cursor.pos.x-tab.length >= 0 ? currentDoc.cursor.pos.x-tab.length:0;
				var fixedSelection = fixSelection(editorSelection);
				if(fixedSelection.y1 !== fixedSelection.y2) {
					//TODO: this is really rough
					for(var x=fixedSelection.y1; x<=fixedSelection.y2; x++) {
						for(var i=0; i<tab.length; i++) {
							currentDoc.cursor.pos.y = x;
							if(currentDoc.getLine(x).charAt(0) == ' ')
								deleteChar(1, currentDoc.getLine(x));
							else
								break;
						}
						
						//console.log(currentDoc.getLine(x));
						dirty[x] = true;
					}
				}
			} else {
				var fixedSelection = fixSelection(editorSelection);
				if(editorSelection.x2 && fixedSelection.y1 !== fixedSelection.y2) {
					var tempCursor = currentDoc.cursor.pos;
					for(var i=fixedSelection.y1; i<=fixedSelection.y2; i++) {
						currentDoc.cursor.pos.y = i;
						currentDoc.updateLine(i, insertChar(tab, 0));
						dirty[i] = true;	//mark the line for rendering
					}
					
					var newX = 0;
					currentDoc.cursor.pos = tempCursor;	//reset the cursor
				} else {
					var newX = currentDoc.cursor.pos.x+tab.length;
					insertChar(tab, currentDoc.cursor.pos.x);
				}
			}
			
			dirty[currentDoc.cursor.pos.y] = true;
			//this should be a call to updateCursor or something that will redraw the cursor and update the charPos
			currentDoc.cursor.setCursor({x: newX, y: currentDoc.cursor.pos.y});
			
			render();
			
			//canvas.focus();
			return false;
		}
		
		//left and right
		if(which == 37 || which == 39) {
			dirty[currentDoc.cursor.pos.y] = true;
			
			//TODO: If CTRL is also held then we should jump the cursor forward to the next (or previous) stopChar (from the current parser) and modify the selection accordingly
			//if(e.ctrlKey) {}
			    
			//just in case shift is held we'll get this up here
			//if(!editorSelection) editorSelection = {x1: currentDoc.cursor.pos.x, x2: null, y1: currentDoc.cursor.pos.y, y2: null};
			
			var currentCursorYPos = currentDoc.cursor.pos.y;
			//update the cursor position
			if(which == 37) {
				//left
				currentDoc.cursor.retreat();
			} else {
				currentDoc.cursor.advance();
			}
			
			//if after our cursor advance/retreat we've also updated the Y position (by falling off the line we were on), then reflect that here
			//TODO: Need this to work for falling off the start of the line as well as the end. Also, this is similar to the up/down handling below. A common bit of code might be a good idea?
			var fullRender = false;
			if(currentDoc.cursor.pos.y != currentCursorYPos && currentDoc.cursor.pos.y > (offset+maxVisibleLines)) {
				self.changeOffset(1);
				fullRender = true;
			}
			
			//if shift is held then we're marking a selection
			if(e.shiftKey) {
			    //console.log(editorSelection);
			    //set the selection to be the cursor pos
			    editorSelection = {x1: editorSelection.x1, x2: currentDoc.cursor.pos.x, y1: editorSelection.y1, y2: currentDoc.cursor.pos.y};
			    var fixedSelection = fixSelection(editorSelection);
			    for(var i=fixedSelection.y1; i<=fixedSelection.y2; i++) dirty[i] = true; //dirty lines within the selection
			    //console.log(editorSelection);
			} else {
			    //if we didn't hold shift then we'll clear the selection
			    clearSelection();
			}
			
			currentDoc.cursor.cursorOn = true;
			render(fullRender);
			return false;
		}
		
		
		//up and down
		if(which == 38 || which == 40) {
			//if we're holding ctrl its like we're scrolling, but by one line at a time
			if(ctrl) {
				self.changeOffset(which == 38 ? -1:1);
				render(true);	//TODO: This is a full render in the sense that everything needs to be redrawn in another place, but not that the syntax highlighting needs redoing. Do we need an extra flag?
				return false;
			}
			
			if(!editorSelection) editorSelection = {x1: currentDoc.cursor.pos.x, x2: null, y1: currentDoc.cursor.pos.y, y2: null};
			
			//update the cursor position
			if(which == 38) {
				//up
				currentDoc.cursor.liftCursor();
				dirty[currentDoc.cursor.pos.y+1] = true;	//this is the line we moved from, so we need to render it to clear the current highlighting
			} else {
				currentDoc.cursor.dropCursor();
				dirty[currentDoc.cursor.pos.y-1] = true;	//this is the line we moved from, so we need to render it to clear the current highlighting
			}
			
			//mark the current line as dirty
			dirty[currentDoc.cursor.pos.y] = true;
			
			if(e.shiftKey) {
			    if(!editorSelection.x2) editorSelection.x2 = currentDoc.cursor.pos.x;
			    editorSelection = {x1: editorSelection.x1, x2: editorSelection.x2, y1: editorSelection.y1, y2: currentDoc.cursor.pos.y};
			} else {
				clearSelection();
			}
			
			//if we've moved past the visible area then render new lines
			var fullRender = false;
			if(currentDoc.cursor.pos.y > (offset+maxVisibleLines) || currentDoc.cursor.pos.y < offset) {
				//offset += charPos[1] > (offset+45) ? 1:-1;
				var inc = currentDoc.cursor.pos.y > (offset+maxVisibleLines) ? 1:-1;
				self.changeOffset(inc);
				fullRender = true;
			}
			
			currentDoc.cursor.cursorOn = true;
			render(fullRender);
			return false;
		}
	}
	
	this.contextmenu = function(e) {
		e.stopPropagation();
		var epos = EventHandler.position(e);
		$('#contextMenu').css({'top': epos.y, 'left': epos.x}).show();
	    	return false;
	}
	
	this.loadFile = function(path) {
		//TODO: We need a check that the file isn't currently open
		var file = '';
		//console.log(path);
		
		//ajax load in the file
		//this should be a synced call
		$.ajax({
			url: 'backend/loadFile.php', 
			data: {name: path}, 
			success: function(data) {
				file = data;
			},
			async: false
		});
		
		//if we've got a document in currentDoc, then stop it's cursor
		if(currentDoc !== null) currentDoc.cursor.stop();	//otherwise we get lots of cursors rendered as their blink functions are still running
		
		//add a new doc to the list we have open
		currentDoc = new Document(this);
		documents.push( currentDoc );
		
		currentDocumentIndex = documents.length - 1;
		
		//set the current document to this on
		//currentDoc = documents[documents.length-1];
		//console.log('current doc');
		//console.log(currentDoc);
		
		//load the file
		currentDoc.loadDocument(file, path);
		
		lines = currentDoc.getLines();
		//console.log(lines);
		
		//cursor = currentDoc.cursor;
		
		//this.getTodos();
		
		//decide the syntax highlighter to apply
		var eng = path.split('.').pop().toUpperCase();	//get the characters after the last '.'
		//alert('using engine: '+eng);
		syntax.engine(eng);
		
		//parse the file upfront
		var localCachedRegions = [];
		for(var y = 0;y<lines.length; y++) {
	            syntax.clearRegions();
	            syntax.highlight(lines[y]);
	            var regions = syntax.getRegions();
	            localCachedRegions[y] = regions;
	            //console.log(regions);
	            //testVars.push(syntax.getVars());
	        }
	        
	        cachedRegions = localCachedRegions;	//set the global
		
		render(true);
		
		
		
		updateOpenDocumentList();
	}
	
	this.openLocalFile = function(file, path) {		
		//if we've got a document in currentDoc, then stop it's cursor
		if(currentDoc !== null && currentDoc !== undefined) currentDoc.cursor.stop();	//otherwise we get lots of cursors rendered as their blink functions are still running
		
		//check that this doc isn't already open
		//TODO: This all needs improving. really we shouldn't be checking this at this stage, but catching it earlier before reading the file from disk
		//TODO: Also need to take into account the full path, not just the filename
		var alreadyOpen = false;
		for(var j=0; j<documents.length; j++) {
			//alert(documents[j].name+" = "+path);
			if(documents[j].name == path) {
				alert('ok found it open');
				alreadyOpen = j;
				break;
			}
		}
		
		if(alreadyOpen === false) {
			//add a new doc to the list we have open
			currentDoc = new Document(this);
			documents.push( currentDoc );
		} else {
			alert('already open as pos: '+j);
			currentDoc = documents[alreadyOpen];
		}
		
		//set the current document to this on
		//currentDoc = documents[documents.length-1];
		//console.log('current doc');
		//console.log(currentDoc);
		
		//load the file
		currentDoc.loadDocument(file, path);
		
		lines = currentDoc.getLines();
		//console.log(lines);
		
		//cursor = currentDoc.cursor;
		
		//this.getTodos();
		
		var eng = path.split('.').pop().toUpperCase();	//get the characters after the last '.'
		eng = syntax.engine(eng);
		//alert('using engine: '+eng);
		cachedRegions = [];	//clear down any cached regions. otherwise we'll apply regions from different docs. these should be in a document, or in a syntax object per document (or something other than editor)
		render(true);
		
		updateOpenDocumentList();
		
		console.log(documents);
	}
	
	this.newFile = function(fileType) {
		if(currentDoc !== null && currentDoc !== undefined) currentDoc.cursor.stop();	//otherwise we get lots of cursors rendered as their blink functions are still running
		
		currentDoc = new Document(this);
		documents.push( currentDoc );
		
		var path = 'development/untitled.js';
		currentDoc.loadDocument(" ", path);
		lines = currentDoc.getLines();
		
		//create a file server side
		var file = currentDoc.getLines();
		file = file.join("\n");
		var name = '../'+currentDoc.name;	//for now we're saving to a development dir so I don't overwrite my files!	
		//save the file back to the server
		$.post('backend/newFile.php', {file: file, name: name}, function(data) {
			alert(data);
			//$('#saved').fadeIn("slow", function() { $(this).fadeOut(); });
		});
		
		
		var eng = path.split('.').pop().toUpperCase();	//get the characters after the last '.'
		eng = syntax.engine(eng);
		//alert('using engine: '+eng);
		cachedRegions = [];	//clear down any cached regions. otherwise we'll apply regions from different docs. these should be in a document, or in a syntax object per document (or something other than editor)
		render(true);
		
		updateOpenDocumentList(documents.length-1);
		
		console.log(documents);
	}
	
	this.closeFile = function(fileIndex) {
		currentDoc = null;
		if(documents[fileIndex-1]) {
			currentDoc = documents[fileIndex-1];
			//updateOpenDocumentList(fileIndex-1);
		} else if(documents[fileIndex+1]) {
			currentDoc = documents[fileIndex+1];
			//updateOpenDocumentList(fileIndex+1);
		}
		
		
		if(currentDoc == undefined) currentDoc = null;
		
		console.log(currentDoc);
		
		documents.splice(fileIndex, 1);
		//lines = [];
		//currentDoc = null;

		//other clean up
		context.clearRect(0, 0, canvas.width, canvas.height);
		
		//clear cachedRegions for this document perhaps?
		this.cachedRegions = [];
		//clear parser details (methods, vars)
		
		
		
		//console.log(documents);
		
		if(currentDoc) {
			//currentDoc.loadDocument(file, path);
		
			//lines = currentDoc.getLines();
			//console.log(lines);
			
			//cursor = currentDoc.cursor;
			
			//this.getTodos();
			
			//var eng = path.split('.').pop().toUpperCase();	//get the characters after the last '.'
			//eng = syntax.engine(eng);
			//alert('using engine: '+eng);
			render(true);
			
			updateOpenDocumentList(0);
			
			//console.log(documents);
		}
	}
	
	this.focusFile = function(fileIndex) {
		if(currentDoc) {
			//clean up the current file
			currentDoc.cursor.stop();
			
			//setup a timer on the current doc to push itself back to the server and unload anything we can from memory after it's been unfocused for X seconds
			//currentDoc.pushBack(10*60);
		}
		
		//might need to read the "state" of the file back from the server, depending on its status
		currentDoc = documents[fileIndex];
		
		syntax.clearRegions();
		syntax.engine('JS');	//TODO: detect the language
		cachedRegions = [];
		if(currentDoc) render(true);
	}
	
	this.getFileContents = function(path) {
		var file = '';
		$.get(path, {}, function(data) {
			file = data
		});
	}
		
	//private functions
	
	var findstr = function(str) {
		//alert('"'+str+'"');
		
		if(!str) {
			//for now a null string counts as us wanting to remove the find panel
			$('#findReplace').hide();
			find = {};
			render(true);
			return;
		}
		
		//$('#findReplace').show();
		
		var matches = [];
		var i = lines.length;
		var localFind = {matches: []};
		var found = '';
		
		//$('#findReplace').css({height:"0px", opacity:0}).animate({height: "200px", opacity:1}, 1000);
		document.getElementById('findReplace').innerHTML = '';
		find = {y1: 0, y2: lines.length, matches: []};
		
		//for(var i=0; i<len; i++) {
		for(;i--;) {
		
			var idx = -1;
			var count = 0;
			
			//TODO: We only need to do this is the case insensitive option is selected
			var lowerCasedLine = lines[i].toLowerCase();	//no sense in lower casing the line loads of times
			
			idx = lowerCasedLine.indexOf(str);
			if(idx != -1) {
			    found = "<span href=\"\" class=\"findmatch\" line=\""+(i+1)+"\">Found match on line "+(i+1)+", char "+idx+"</span><br/>"+found;     //matches[i].push(idx);
			    
			    if(!localFind.matches[i]) {
			        //console.log('logging a find on line '+i);
			        localFind.matches[i] = [];
			    }
			    localFind.matches[i].push({x1: idx+1, x2: idx+str.length+1});
			    
			    //mark this line as "dirty" so it's re-rendered should these matches be highlighted
			    dirty[i] = true;	
			    //TODO: I'm increasingly thinking this simple dirty flag isn't enough. Here we want to render highlighted matches (if enabled), but setting dirty will cause a parse of the text of the line, which for this highlighting isnn't necessary. And we might not even be highlighting anyway
			    //I think something more robust is needed (perhaps along with the RenderQueue/Action idea. addRenderAction(line, ['findmatch'])
			
			    //search for further matches on this line
			    while(idx != -1) {
			        idx = lowerCasedLine.indexOf(str, idx+str.length);
			        if(idx != -1) {
			            found += "Found match on line "+i+", char "+idx+"<br/>";     //matches[i].push(idx);
			            
			            if(!localFind.matches[i]) {
			                //console.log('logging a find on line '+i);
			                localFind.matches[i] = [];
			            }
			            
			            localFind.matches[i].push({x1: idx+1, x2: idx+str.length+1});
			        }
			        
			        count++;
			        if(count > 10) { console.log('breaking on count'); break; }	//a restirction on the number of matches per line? I suppose it makes sense just in case we get into an infinite loop
			    }
			}
		}
		
		find.matches = localFind.matches;
		
		document.getElementById('findReplace').innerHTML = found;
		
		//TODO: [DONE] This could just mark the lines where we found matches for rendering
		//TODO: Actually the full refresh helps clear the existing match highlights... could mark these upfront as well. not sure whether it's worth the hassle...
		//if(localFind.matches.length > 0) 
			render(true);	//only render again if we found some matches
		//TODO: In fact we only need to render again if we found matches and the match highlighting is on (getting better)
	}
	
	var saveFile = function(fileIndex) {
		var file = currentDoc.getLines();
		file = file.join("\n");
		var name = '../development/'+currentDoc.name.replace('development/', '');	//for now we're saving to a development dir so I don't overwrite my files!	
		//save the file back to the server
		$.post('backend/saveFile.php', {file: file, name: name}, function(data) {
			alert(data);
			$('#saved').fadeIn("slow", function() { $(this).fadeOut(); });
		});
	}
	
	/* 
	could we worker up rendering so a different worker render each style for examnple, therefore rendering all in parallel?
	*/
	var syntax = new Syntax(self);  
	
	//TODO: An alternative rendering approach. We setup an interval which calls render X times a second, defining our max FPS.  Then functions that would normally call render set a "renderAction" flag or something
	//When render is called it checks to see if there is anything to do and if not immediately bombs out, otherwise it does either what it currently does, or what's in the "RenderStack" (a list of things to do)
	//I'm not sure what this would do for general performance/interactivity - but I guess it might reduce the amount of time profiles show us in the render function
	//setInterval(function() {
	//	render(false);
	//}, 50);
	
	var renderTimer = 0;
	var renderRegulator = null;
	var renderCount = 0;

	function render(full) {
		//renderCount++;
		//console.log('render count ' + renderCount);

		/*
		//An experiment in setting a max FPS. 20fps doesn't seem smooth enough. So we'll need to make things faster (only when scrolling using the keyboard at the moment)
		if(renderTimer > 0) {
			var timeBetweenRenderCalls = new Date().getTime() - renderTimer;
			if(timeBetweenRenderCalls < 50) {
				var diff = 50 - timeBetweenRenderCalls;
				clearTimeout(renderRegulator);
				renderRegulator = setTimeout(function() {
					render(full);
				}, diff);
				return;
			}
			
			//console.log("Render called again after " + timeBetweenRenderCalls + "ms later...");
		}
		
		renderTimer = new Date().getTime();
		*/
		
		//console.log('rendering');
		//console.log(render.caller);

	    //make sure w've got a document to work with
	    if(currentDoc === null || currentDoc === undefined) return;
	    
	    //reset the cursor blink so we don't end up with ghosty cursors
	    //clearInterval(cursorBlink);
	    clearInterval(currentDoc.cursor.cursorBlinkTimer);
	    //console.log(render.caller);
	    
	    /*
	    // Build a worker
	    var worker = new Worker("testworker.js");
	    
	    // Listen for incoming messages
	    worker.onmessage = function(e){
	        alert(e.data.code);
	        console.log(e.data.other);
	    };   
	    
	    // Start the worker
	    worker.postMessage( {code:"var foo = false; //a test line of code", other:[true, false, true]} );
	    */
	    var lines = currentDoc.getLines();
	            
	    if(lines.length <= 0) lines = [' '];
	    var len = lines.length;
	    var maxLines = maxVisibleLines;
	    var y = offset;
	    var maxLine = y+maxLines
	    if(maxLine > len) maxLine = len;
	    
	    //if(maxLine > len) maxLine = len;
	        
	    //quick check to see if we should just not do anything
	    if(offset < 0 || ((len-maxLines) > 0 && offset > (len-maxLines))) { offset = offset < 0 ? 0:(len-maxLines); return; }
	
	    
	    
	    //only do this is we're doing a full refresh
	    if(full) {
	    	//context.clearRect(0,0,canvas.width, canvas.height);
	    	// Store the current transformation matrix
		context.save();
		
		// Use the identity matrix while clearing the canvas
		context.setTransform(1, 0, 0, 1, 0, 0);
		context.clearRect(0, 0, canvas.width, canvas.height);
		
		// Restore the transform
		context.restore();
		
		//shift up the existing image
	    	
	    	
	    }
	    
	    
	    
	    //I think we always want to refresh the whole of this panel
	    //the line numbers as well
	    /*
	    lineCanvas.width = (len + ':  ').length * mwidth;
	    lineContext.font = context.font;
	    lineContext.textBaseline = context.textBaseline;
	    */
	    lineContext.clearRect(0,0,lineCanvas.width, lineCanvas.height);
	    
	    
	    
	    //update the canvas width
	    //canvas.width = document.body.clientWidth - (lineCanvas.width + 5);
	    //context.font = lineContext.font;
	    //context.textBaseline = lineContext.textBaseline;
	    
	    //console.log(cachedRegions);
	
	    //console.log(editorSelection);
	    
	    var fillCount = 0;
	    
	    //highlight the current line

	    if(currentDoc.cursor.pos.y >= y && currentDoc.cursor.pos.y <= maxLine) {
	        context.fillStyle = options.currentLineHighlight;
	        context.fillRect(0, lineHeight*(currentDoc.cursor.pos.y-offset), canvas.width, 18);
	    }
	    
	    
	    var localCachedRegions = cachedRegions;
	    
	    
	    //set initial state of the canvas
	    context.fillStyle = '#000000';
	    
	    for(; y<maxLine;y++) {
	    	
	    	//let's render the line number first
	
	        lineContext.fillText((y+1)+':', 10, lineHeight*(y-offset));
	        
	        var text = lines[y];
	    
	        var testVars = [];
	        
	        //TODO: If a line doesn't contain any renderable characters (just spaces, tabs etc) then don't bother rendering it
	        //TODO: Render on a style basis, not a line basis. I.e. render every line for the current style, then again for the next. This reduces the calls to fillStyle (which may improve performance?)
	        
	        if(renderMode) {
		        if(!localCachedRegions[y]) {
		            syntax.clearRegions();
		            syntax.highlight(text);
		            var regions = syntax.getRegions();
		            localCachedRegions[y] = regions;
		            //console.log(regions);
		            //testVars.push(syntax.getVars());
		        } else {
		            //if the line hasn't changed don't bother re-rendering it
		            //console.log(dirty);
		            if(!dirty[y] && !full) continue;	//TODO: This is incomplete. In the case of scrolling on the X for example, we don't need to recalculate the syntax of the line, but we do need to render it
		            
		            //var regions = cachedRegions[y];
		            if(dirty[y]) {
		            
				syntax.clearRegions();
				syntax.highlight(text);
				var regions = syntax.getRegions();
				localCachedRegions[y] = regions;
			   }
		            //console.log('rendering line: '+y);
		        }
	        }
	        
	        //console.log('regions');
	        //console.log(cachedRegions);
	        
	        //if we're only rendering the lines marked as changed, then clear the line
	        //the Y coord is adjusted to take into account we might have a vertical offset. I.e. line 10 on screen will be line 20 if we've got an offset of 10
	        //but the rendering works on the distance from the top of the canvas and is therefore independent of the offset, so (y-offset) = actual pos
	        if(!full && y != currentDoc.cursor.pos.y) context.clearRect(0,lineHeight*(y-offset),canvas.width,lineHeight);
	        
	        //console.log(regions);
	        
	        //console.log('line coming into render: '+text);
	        
	        
	        /*
	        //experimenting with hightlighting certain areas of text
	        if(y >= charPos[1] - 2 && y <= charPos[1] + 2) {
	            context.globalAlpha = 1;
	        } else {
	            context.globalAlpha = 0.5;        
	        }
	        */
	        
	        /*if(charPos && y==charPos[1]) {
	            context.fillStyle = '#444444';
	            context.fillRect(0, 18*(y-offset), canvas.width, 18);
	        }*/
	        
	        
	        //SELECTIONS
	        if(editorSelection.x2) {
	        	/*
	        	TODO: I have an alternative thought on how to handle this
	        	Given that we're successfully moving the cursor with the mouse move event I would do the following:
	        	1) Do away with the selection as such (poss repuspose)
	        	2) On mouse down store the position
	        	3) On mouse move update the canvas, and use the cursors current position as the second set of coords
	        	
	        	You can then swap these to get the lowest line number first etc
	        	
	        	Also. When the selection is swapped over make sure that the rendering logic changes, as when a selection moves up it selects from the end of the line backward
	        	The current logic will select (or render at least) from the front of the line to the pos (needs to be from line.length to the position)
	        	*/
	        	
	                //fix up our editorSelection, we need x1 and y1 to be the lower values and x2 and y2 to be greater
	                
	                //quick dump out of here if the selection is just a point
	                //TODO: !
	                //if(editorSelection.x1 == editorSelection.x2 && editorSelection.y1 == editorSelection.y2) break;	//hmm not working...
	                
	                var renderSelection = {};
	                /*if(editorSelection.x1 > editorSelection.x2) {
	                    //console.log('swapping selection X');
	                    var tX = editorSelection.x1;
	                    renderSelection.x1 = editorSelection.x2;
	                    renderSelection.x2 = tX;
	                }*/
	                
	                renderSelection.x1 = editorSelection.x1;
	                renderSelection.x2 = editorSelection.x2;
	
	                if(editorSelection.y1 > editorSelection.y2) {
			    //console.log('swapping selection Y');
	                    var tY = editorSelection.y1;
	                    renderSelection.y1 = editorSelection.y2;
	                    renderSelection.y2 = tY;
	                    
	                    var flippedSelection = true;
	                    
	                    var from = {x: editorSelection.x2, y: editorSelection.y2};
	                    var to = {x: editorSelection.x1, y: editorSelection.y1};
	                } else {
		                renderSelection.y1 = editorSelection.y1;
		                renderSelection.y2 = editorSelection.y2;
	                }
	                
	                //console.log(from);
	                //console.log(to);
	                
	                
	                
	                //figure out our upper and lower Y bounds
		        //var yLow = renderSelection.y2 > renderSelection.y1 ? renderSelection.y1:renderSelection.y2;
		        //var yHigh = renderSelection.y2 > renderSelection.y1 ? renderSelection.y2:renderSelection.y1;
	                
	                var yLow = renderSelection.y1;
	                var yHigh = renderSelection.y2;
	                
	                //console.log(renderSelection);
			//console.log(yLow);
			//console.log(yHigh);
		        
			var drawSelection = true;
			if(yHigh != yLow) {
				//yHigh -= 2;
			        if(y > yLow && y < yHigh) {
			            //console.log('a middling line');
			            var x = 0;
			            var w = lines[y].length*mwidth;
			        } else if(y == yHigh) {
		                    if(!flippedSelection) {
			                    var x = 0;
				            var w = renderSelection.x2*mwidth;
				    } else {
				    	    //if we've flipped the selection then the low is now the high and vice versa, so need to swap the rendering logic, as below!
				    	    var x = 0;
				            var w = to.x*mwidth; 
				    }
		                } else if(y == yLow) {
		                    if(!flippedSelection) {
			                    var x = (renderSelection.x1)*mwidth;
				            var w = lines[yLow].length*mwidth;
			            } else {
				  	    //if we've flipped the selection then the low is now the high and vice versa, so need to swap the rendering logic, as below!
				            var x = (from.x)*mwidth;
				            var w = (lines[from.y].length-from.x)*mwidth;
			            }
		                } else {
		                	drawSelection = false;
		                }
		        } else {
		        	if(y == yHigh) {
			        	var x = (renderSelection.x1)*mwidth;
					var w = ((renderSelection.x2-renderSelection.x1))*mwidth;
				} else {
					drawSelection = false;
				}
		        }
		        
		        if(drawSelection) {
		        	//console.log(flippedSelection);
			        //console.log('rendering: x,y,w:'+x+','+y+','+w+'');
				context.fillStyle = '#9DBFD1';
				context.fillRect(x, 18*(y-offset), w, 18);
			}
		}
		
	        
	        //FIND MATCHES
	        //TODO: If we pull this out of the Y loop (and do something else to provide the line coord), then we can reduce the number of calls to fillStyle by the number of lines being rendered
	        if(find.matches) {
		        var yLow = find.y1;	//don't really need to declare these in the for loop?
		        var yHigh = find.y2;
		            
		        if(y >= yLow && y <= yHigh) {
		            var localMatches = find.matches;	//don't really need to do this in the for loop, just within the render function
		            
		            context.globalAlpha = 1;	//if we did this outside the for loop we wouldn't need to do this each loop either
		            //var x = 10;	//not needed?
		            
		            if(localMatches[y]) {
		            	//TODO: if we're rendering this line and it's not a full refresh of the canvas then we should be suspicious of the content of this line. We should redo and update our find.matches for this line. Addendum: We could get away with not doing this from a rendering perspective if we're not highlighting the matches (but the match list would still be wrong)
		            	//If you don't do the above then you'll end up with highlighted matches where there are none.
		            
		            	if(dirty[y]) {
		            	    //localMatches[y] = findstr(find.currentSearchString, y);	//recheck this line for matches and update as applicable
		                }
		                
		                for(var j=0; j<localMatches[y].length; j++) {
		                    x1 = localMatches[y][j].x1*mwidth;
		                    x2 = localMatches[y][j].x2*mwidth;
		                    
		                    var w = x2 - x1;
		                    
		                    context.fillStyle = '#FFFF0D';
		                    context.fillRect(x1, 18*(y-offset), w, 18);
		                }
		            }
		            
		            context.globalAlpha = 1;
		        }
	        }
	        
	        /*
	        //INLINE EXTERNAL DOCUMENTS
	        if(y >= includeDocLines.start && y <= includeDocLines.end) {
	            if(charPos[1] >= includeDocLines.start && charPos[1] <= includeDocLines.end) { 
	                context.globalAlpha = 1;
	            } else {
	                context.globalAlpha = 0.5;
	            }
	            
	            context.fillStyle = 'rgba(100,200,200,0.35)';
	            context.fillRect(10, 18*(y-offset), canvas.width, 18);
	        } else {
	            if(charPos[1] >= includeDocLines.start && charPos[1] <= includeDocLines.end) { 
	                context.globalAlpha = 0.5;
	            } else {
	                context.globalAlpha = 1;
	            }
	        }
	        */
	        
	        //to reduce any complexity in editorSelections we could simply render selected lines as white text
	        //this would mean quicker rendering when selecting, which would free up time to do other stuff
	        
	        //just plain white. or syntax highlighted
	        if(!renderMode) {
	            //for testing editing lets do a really simple render. just output the whole line in white
	            context.fillText(text, 10, 18*(y-offset));
	        } else {
	            
	            var line = '';
	            var cPos = 0;
	            
	            //console.log(text);
	            
	            for(var style in localCachedRegions[y]) {
	                if (!localCachedRegions[y].hasOwnProperty(style)) continue;
	                
	                //console.log(regions);
	                
	                line = '';
	            	cPos = 0;
	                var thisRegion = localCachedRegions[y][style];
	                for(var sr=0; sr<thisRegion.length; sr++) {
	                    //for(;cPos<regions[style][sr].spos; cPos++) line += ' ';
	                    
	                   // try {
	                    	    //var aLen = (regions[style][sr].spos - cPos)+1;
	                    	    //if(aLen <= 0) aLen = 1;
		                    line += Array((localCachedRegions[y][style][sr].spos - cPos)+1).join(' ');
		            /*} catch(e) {
		            	console.log(e.description);
		            	console.log(style);
		            	console.log(localCachedRegions[y][style][sr]);
		            	console.log(cPos);
		            	console.log(text);
		            	console.log(text.substring(thisRegion[sr].spos, thisRegion[sr].epos));
		            }*/
		            
		            
	                    //console.log(text.substring(thisRegion[sr].spos, thisRegion[sr].epos));
	                    line += text.substring(localCachedRegions[y][style][sr].spos, localCachedRegions[y][style][sr].epos);
	                    cPos = localCachedRegions[y][style][sr].epos;
	                }
	                
	                //console.log(line);
	                
	                //if(style == '#414CA6') context.font = 'bold 11pt monospace';
	                //else context.font = '11pt monospace';
	                
	                context.fillStyle = style;
	                context.fillText(line, 10, 18*(y-offset));
	                //fillCount++;
	            }
	            
	            
	            
	        }
	    }
	    
	    //update the global version of things for when we call back into here
	    cachedRegions = localCachedRegions;
	    
	    //console.log(cachedRegions);
	    
	    //console.log('fillText count: '+fillCount);
	    
	    //once we've drawn things, nothing should be dirty. for a few milliseconds anyway!
	    dirty = {};
	    
	    //render the cursor
	    /*if(charPos[1] > offset && charPos[1] < offset+45) {
		    context.fillStyle = '#06ACC2';
		    context.fillRect((charPos[0]+1)*mwidth, 18*charPos[1], 1, 18);
	    }*/
	    
	    //update file details
	    document.getElementById('fileDetail').innerHTML = "Lines: "+lines.length+", Position: "+charPos[1]+","+charPos[0];
	    
	    //set the cursor off again
	    //cursorBlink = setInterval("blinkCursor()", 350);
	    //cursorOn = true;
	    //cursor.pos.x = charPos[0]+1;
	    //cursor.pos.y = charPos[1];
	    charPos[0] = currentDoc.cursor.pos.x;
	    charPos[1] = currentDoc.cursor.pos.y;
	    currentDoc.cursor.blink();
	   // cursor.cursorOn = true;
	   
	   //if(full) {
	//	   document.getElementById('edits').innerHTML = dump(testVars);
	   //}
	
		/*
		xPositions = [];
		yPositions = [];
		
		//Draw vertical lines   
		for (var x = 0; x < 200*mwidth; x += mwidth) {
			context.moveTo(x, 0);
			context.lineTo(x, canvas.height);
			xPositions.push({min: x, max: x+mwidth});
		}
	
		for (var y = 0; y < 50*18; y += 18) {
			context.moveTo(0, y);
			context.lineTo(canvas.width, y);
			
			yPositions.push({min: y, max: y+18});
		}
		
		context.strokeStyle = "#eee";
		context.stroke();
		*/
	}
}).call(Editor.prototype);