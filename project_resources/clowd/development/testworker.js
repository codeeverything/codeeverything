// Get the incoming information from the parent
onmessage = function(e){
  var code = e.data.code;
  postMessage({code:"worker responding.\nReceived the following code to parse:\n"+code, other:e.data.other});
};