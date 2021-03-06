(function ($) {
	'use strict';
	if(!window.Scene)
		window.Scene = {};
		
	window.Scene.PhotoView = Backbone.View.extend({
		tagName  : "div",
		className : "photo",
		template : _.template("<img src='<%=e.image%>'/>"),
		initialize: function () {
			_.bindAll(this,"onClick","onMoved");
			
			this.listenTo(this.model, 'change', this.render);
			
			this.$el.click(this.onClick);
			this.$el.draggable({cursor: "crosshair"})
					.on("drag",this.onMoved)
					.css({"position":"absolute"});
			
			this.$el.html(this.template({e : this.model.toJSON()}));
			this.render();
		},
		onMoved : function(){
			var size = this.model.get("size");
			this.model.set("position",{
				x : (this.$el.position().left) / $(".event").width() * 100,
				y : (this.$el.position().top ) / $(".event").height() * 100
			});
			window.Scene.socket.emit("Photo.update",this.model.toJSON());
		},
		onClick : function(){
			if(window.Scene.photoDetailView){
				window.Scene.photoDetailView.show(this.model);
			}
		},
		render: function () {
			var position = this.model.get("position");
			var size	 = this.model.get("size");
			this.$el.css({
				left   : position.x+ "%",
				top    : position.y+ "%",
				width  : size.width  + "%",
				height : size.height + "%",
				"-webkit-transform": "rotate(" + this.model.get("rotation") + "deg)"
			});
			return this;
		}
	});
})(jQuery);