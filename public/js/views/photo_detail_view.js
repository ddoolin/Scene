(function ($) {
	'use strict';
	if(!window.Scene)
		window.Scene = {};
		
	window.Scene.PhotoDetailView = Backbone.View.extend({
		el : "#photo_detail_modal",
		initialize: function () {
		},
		show  : function(model){
			this.model = model;
			this.render();
			this.$el.modal("show");
		},
		hide : function(){
			this.$el.modal("hide");
		},
		render: function () {
			this.$el.find(".photo_img").attr("src",this.model.get("image"));
			this.$el.find(".comment_list")
		}
	});
})(jQuery);