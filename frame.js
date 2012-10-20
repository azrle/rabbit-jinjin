function hideUp() {
	if (stop == null) return;
	if (stop) return;
	pause();
	$('#jinjin').fadeOut(200);
}
function showUp() {
	if (stop == null) return;
	if (!stop) return;
	start();
	$('#jinjin').fadeIn(200);
}

//chrome.extension.onRequest.addListener(
  //  function(request, sender, sendResponse) {
//		if (request.msg == 'hideUp') hideUp();
//		if (request.msg == 'showUp') showUp();
 //  }
//);

function addMask() {
	var op = {
                    opacity: 0.8,
                    z: 1000,
                    bgcolor: '#ffffff'
                };
	var maskDiv=$('<div id="maskAllDiv">&nbsp;</div>');
	maskDiv.appendTo(document.body);
	maskDiv.css({
					display : "none",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    'z-index': op.z,
					width: window.innerWidth,
                    height: window.innerHeight,
                    'background-color': op.bgcolor,
                    opacity: op.opacity
                });
}
function maskAll() {
	$('#maskAllDiv').fadeIn(300);
}
function unMask() {
	$('#maskAllDiv').fadeOut(300);
}
$(document).ready(function() {
	$(document.body).before('<canvas id="jinjin" width="'+window.innerWidth+'" height="'+window.innerHeight+'" style="position:fixed; right: 0px; bottom: 10px; z-index : 9999;"></canvas>');
	//$(document.body).css('opacity', '0.5');
	$('#jinjin').css('opacity','1');
	addMask();
	init();
});
