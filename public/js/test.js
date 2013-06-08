$(function(){
	var event = $(".event")[0];
//				event.addEventListener("gesturestart", gestureStart, false);
	event.addEventListener("gesturechange", function(e){
		e.preventDefault();
		console.log(e);
		
		event.style.webkitTransform = 'scale(' + e.scale  + ')';
		
		if(e.scale > 1){
			var center = {
				x : e.layerX,
				y : e.layerY
			};
			var size = {
				left : $(".event").width() * (e.scale-1)/2,
				top  : $(".event").height() * (e.scale-1)/2
			}
//			$(".event").css(size);
		} else {
			$(".event").css({left : 0,top:0});
		}
		
	}, false);
//				event.addEventListener("gestureend", gestureEnd, false);
});