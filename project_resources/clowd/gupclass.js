/*
 *         TODO
 * Resume file upload from previous session?
 * Timeout handling
 * Return JSON status for server side error handling
 * Options for file namimg/renaming schemes
 * 
 */

GUP = function() {
    this.CHUNK_BYTES = 50000;
    
    this.isIE = google.gears.factory.getBuildInfo().indexOf(';ie') > -1;
    this.isFirefox = google.gears.factory.getBuildInfo().indexOf(';firefox') > -1;
    this.isSafari = google.gears.factory.getBuildInfo().indexOf(';safari') > -1;
    this.isNpapi = google.gears.factory.getBuildInfo().indexOf(';npapi') > -1;
    
    this.dropZone;
    this.desktop = google.gears.factory.create('beta.desktop');
    this.localServer = google.gears.factory.create('beta.localserver');
    this.gupStore = this.localServer.createStore('gupStorage');

    
    this.queue = new Array;
    this.index=0;
    this.processing=false;
    
    this.finishDrag = function(event, isDrop) {
        this.desktop.setDragCursor(event, 'copy');
        if (this.isFirefox) {
            if (isDrop) {
                event.stopPropagation();
                $("#dropZone").removeClass("hover");
//                console.log("Event Stopped");
            }
        } else if (this.isIE || this.isSafari || this.isNpapi) {
            if (!isDrop) {
                event.returnValue = false;
            }
        }
        else {
            event.stopPropagation();
            return false;
        }
    };
    
    this.handleDragEnter = function(event) {
        $("#dropZone").addClass("hover");
        this.finishDrag(event, false);
    };
    
    this.handleDragOver = function(event) {
        this.finishDrag(event, false);
    };
    
    this.handleDragLeave = function(event) {
        $("#dropZone").removeClass("hover");
    };
    
    this.sanitize = function(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };
    
    this.fileFailed = function(reason) {
        console.log("This file is being aborted: "+reason);
        $("#fileStatTr"+this.queue[0]['index']).addClass("failed");
        $("#fileStat"+this.queue[0]['index']).html("Failed");
        $("#fileStatBar"+this.queue[0]['index']).css("width","100px");
        this.queue.splice(0, 1);
    };
    
    
    
    this.sendChunk = function(filename, chunk, start, end, total) {
        var request = google.gears.factory.create('beta.httprequest');
        request.open('POST', 'upload.php');
        request.setRequestHeader('Content-Disposition', 'attachment; filename="' + filename + '"');
        request.setRequestHeader('Content-Type', 'application/octet-stream');
        request.setRequestHeader('Content-Range', 'bytes '+start+'-'+end+'/'+total);
      
        var self = this;
        request.onreadystatechange = function() {
            if (request.readyState == 4) {
//                console.log(request.responseText);
                eval("var status = "+request.responseText+";");
                if(status['status'] == 100) {
                    if(self.queue[0]['retryChunk'] > 0) self.queue[0]['retryChunk']=0;
                    self.queue[0]['uploaded']+=1;
                    console.log("Chunk "+self.queue[0]['uploaded']+" / "+self.queue[0]['chunks']+" uploaded. ");
//                    $("#returnSpace").html(request.responseText);
                    
                    var perc = Math.floor((end+1)/total*100);
                    $("#fileStat"+self.queue[0]['index']).html(perc+"%");
                    $("#fileStatBar"+self.queue[0]['index']).css("width",perc+"px");
                    
                    
                    if(perc==100)  {
                        //var fn = self.queue[0]['file'].name;
                        //self.gupStore.remove('thumbnail_'+fn);
                        //console.log(self.gupStore.isCaptured('thumbnail_'+fn), fn);
                        $("#fileStatTr"+self.queue[0]['index']).fadeOut("slow");
                        $('#thumbOut').append('<div class="thumb"><a href="'+status['url']+'"><img src="'+status['thumb']+'" /></a></div>');
                    }
                }
                else if(status['status'] == 101) {
                    if(self.queue[0]['retryChunk'] < 4) {
                        self.queue[0]['retryChunk']++;
                        console.log("Chunk "+(self.queue[0]['uploaded']+1)+" / "+self.queue[0]['chunks']+" Failed to upload. Retry attempt #"+self.queue[0]['retryChunk']+".");
                    }
                    else {
                        self.fileFailed("Five failed chunk upload attemps in a row.");
                    }
                }
                else if(status['status'] == 102) {
                    self.fileFailed("File uploaded was not a valid image.");
                }
                else if(status['status'] == 0) {
                    self.fileFailed("There was an unexpected error.");
                }
                else {
                    console.log(status);
                }
                
                self.processQueue();
            }
        };
        request.send( chunk );
    };
    
    this.processQueue = function() {
        this.processing=true;
        if(this.queue.length > 0) {
            var f=this.queue[0];
            if(f['uploaded'] == f['chunks']) {
                console.log(f['title']+" has been uploaded.");
                this.queue.splice(0, 1);
//                console.log("Spliced, Length: "+this.queue.length);
                this.processQueue();
                return;
            }
            else {
                if(f['uploaded'] == 0) {
                    var thumb = this.createThumbnail(f['file']);
                    if(thumb != false) $("#fileStatThumb"+f['index']+"").html("<img src=\""+thumb+"\" alt=\"\" />");
                }
                var start=0;
                var offset=this.CHUNK_BYTES;
                if(f['uploaded'] > 0) start = f['uploaded']*this.CHUNK_BYTES; 
                var end = start+this.CHUNK_BYTES-1;
                if(end > f['bytes']) end = f['bytes']-1;
                                
//                console.log("Sending: ",start,end,f['bytes']);
                if( (start+offset) > (f['bytes']-1) ) offset = (f['bytes']-start);
                var thischunk = f['file'].blob.slice(start,offset);
                this.sendChunk(f['title'],thischunk,start,end,f['bytes']);
            }
        }
        else {
            console.log("All done!");
            this.processing=false;
        }
    };
    
    this.createThumbnail = function(file) {
        try {
            var md = this.desktop.extractMetaData(file.blob);
            var gearsCanvas = google.gears.factory.create('beta.canvas');
            var thumb_height = md.imageHeight;
            var thumb_width = md.imageWidth;
            gearsCanvas.decode(file.blob);

            if(thumb_height >50) {
                thumb_height=50;
                thumb_width = Math.floor(50*md.imageWidth/md.imageHeight);
            }
            if(thumb_width > 200) {
                thumb_width=200;
                thumb_height=Math.floor(md.imageHeight*200/md.imageWidth);
            }
         
            gearsCanvas.resize(thumb_width, thumb_height, 'nearest');
            var thumbnailBlob = gearsCanvas.encode();
            var thumbName = 'thumbnail_'+file.name;
            this.gupStore.captureBlob(thumbnailBlob, thumbName);
            return thumbName;
        } catch (err) {
            console.log("Caught error: "+err);
            return false;
        }
    };
    
    this.handleDrop = function(event) {
        var data = this.desktop.getDragData(event, 'application/x-gears-files');
        var files = data && data.files;
    
        if (files) {
            for (i = 0; i < files.length; i++) {
                var file = files[i];
                if(file.blob.length > this.CHUNK_BYTES) var chunks = Math.ceil(file.blob.length/this.CHUNK_BYTES);
                else var chunks = 1;
                    
                this.queue[this.queue.length] = {
                    "title": this.sanitize(file.name),
                    "file": file,
                    "bytes": file.blob.length,
                    "chunks": chunks,
                    "uploaded": 0,
                    "index": this.index,
                    "retryFile": 0,
                    "retryChunk": 0
                };
                
//                var thumbName = this.createThumbnail(file);
                
                $("#uploadStatus").append("" +
                        "<tr id='fileStatTr"+this.index+"'>" +
                        "<td id='fileStatThumb"+this.index+"'></td>"+
                        "<td>"+this.sanitize(file.name)+"</td><td><span id='fileStat"+this.index+"'>0%</span></td><td><div class='fileStatBarWrapper'> <div id='fileStatBar"+this.index+"' class='fileStatBar'></div></div></td>" +
                        "</tr>");
                
                this.index++;
              }
//            console.log(this.queue);
        }
        this.finishDrag(event, true);
        if(this.processing == false) this.processQueue();
        return false;
    };
    
    this.setup = function(dropZone) {
        var gobj = this;
        this.dropZone = document.getElementById(dropZone);
        if (this.isFirefox) {
            this.dropZone.addEventListener('dragenter', function(e){gobj.handleDragEnter(e);}, false);
            this.dropZone.addEventListener('dragover',  function(e){gobj.handleDragOver(e);},  false);
            this.dropZone.addEventListener('dragexit',  function(e){gobj.handleDragLeave(e);}, false);
            this.dropZone.addEventListener('dragdrop',  function(e){gobj.handleDrop(e);},      false);
        } else if (this.isIE) {
            this.dropZone.attachEvent('ondragenter', function(e){gobj.handleDragEnter(e);});
            this.dropZone.attachEvent('ondragover',  function(e){gobj.handleDragOver(e);} );
            this.dropZone.attachEvent('ondragleave', function(e){gobj.handleDragLeave(e);});
            this.dropZone.attachEvent('ondrop',      function(e){gobj.handleDrop(e);}     );
        } else if (this.isSafari || this.isNpapi) {
            this.dropZone.addEventListener('dragenter', function(e){gobj.handleDragEnter(e);}, false);
            this.dropZone.addEventListener('dragover',  function(e){gobj.handleDragOver(e);},  false);
            this.dropZone.addEventListener('dragleave', function(e){gobj.handleDragLeave(e);}, false);
            this.dropZone.addEventListener('drop',      function(e){gobj.handleDrop(e);},      false);
        }
    };
};
