(function ($) {
	'use strict';
	if(!window.Scene)
		window.Scene = {};
		
	window.Scene.PhotoView = Backbone.View.extend({
		tagName  : "div",
		className : "photo",
		template : _.template("<img src='<%=e.image%>'/>"),
		initialize: function () {
			_.bindAll(this,"onClick");
			this.listenTo(this.model, 'change', this.render);
			this.render();
			
			this.$el.click(this.onClick);
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
				left   : position.x - size.width/2  + "%",
				top    : position.y - size.height/2 + "%",
				width  : size.width  + "%",
				height : size.height + "%",
				"-webkit-transform": "rotate(" + this.model.get("rotation") + "deg)"
			});
			this.$el.html(this.template({e : this.model.toJSON()}));
			return this;
		}
	});
})(jQuery);