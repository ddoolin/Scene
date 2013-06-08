(function ($) {
	'use strict';
	window.Scene.EventView = Backbone.View.extend({
		el: ".event",
		initialize: function () {
			_.bindAll(this,"onPhotoCreate","onPhotoUpdate");
			
			this.listenTo(this.model, 'change', this.render);
			this.photo_views = {};
			
			this.model.get("photos").forEach(this.onPhotoCreate);
		},
		onPhotoCreate : function(photo){
			var view = new window.Scene.PhotoView({model : new window.Scene.Photo(photo)});
			this.$el.append(view.$el);
			this.photo_views[photo._id] = view;
		},
		onPhotoUpdate : function(photo){
			this.photo_views[photo._id].model.set("position",photo.position);
		},
		registerWSEvents : function(socket){
			socket.on("Photo.create",this.onPhotoCreate);
			socket.on("Photo.update",this.onPhotoUpdate);
		},
		render : function () {
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		}
	});
	
	// CollageView = Backbone.View.extend({
	// 	el : $(".collage"),
	// 	//template: _.template($('#item-template').html()),
	// 	events: {
	// 		'click .toggle' : 'toggleCompleted',
	// 		'dblclick label': 'edit',
	// 		'click .destroy': 'clear',
	// 		'keypress .edit': 'updateOnEnter',
	// 		'blur .edit'	: 'close'
	// 	},
	// 	// The TodoView listens for changes to its model, re-rendering. Since there's
	// 	// a one-to-one correspondence between a **Todo** and a **TodoView** in this
	// 	// app, we set a direct reference on the model for convenience.
	// 	initialize: function () {
	// 		this.listenTo(this.model, 'change',  this.render);
	// 		this.listenTo(this.model, 'destroy', this.remove);
	// 		this.listenTo(this.model, 'visible', this.toggleVisible);
	// 	},
	// 	render: function () {
	// 		this.$el.html(this.template(this.model.toJSON()));
	// 		this.$el.toggleClass('completed', this.model.get('completed'));
	// 		this.toggleVisible();
	// 		this.$input = this.$('.edit');
	// 		return this;
	// 	},
	// 	toggleVisible: function () {
	// 		this.$el.toggleClass('hidden', this.isHidden());
	// 	},
	// 	isHidden: function () {
	// 		var isCompleted = this.model.get('completed');
	// 		return (// hidden cases only
	// 			(!isCompleted && app.TodoFilter === 'completed') ||
	// 			(isCompleted && app.TodoFilter === 'active')
	// 		);
	// 	},
	// 	toggleCompleted: function () {
	// 		this.model.toggle();
	// 	},
	// 	edit: function () {
	// 		this.$el.addClass('editing');
	// 		this.$input.focus();
	// 	},
	// 	close: function () {
	// 		var value = this.$input.val().trim();
	// 		if (value) {
	// 			this.model.save({ title: value });
	// 		} else {
	// 			this.clear();
	// 		}
	// 		this.$el.removeClass('editing');
	// 	},
	// 	updateOnEnter: function (e) {
	// 		if (e.which === ENTER_KEY) {
	// 			this.close();
	// 		}
	// 	},
	// 	clear: function () {
	// 		this.model.destroy();
	// 	}
	// });
})(jQuery);
