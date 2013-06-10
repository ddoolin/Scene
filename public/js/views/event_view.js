(function ($) {
    "use strict";

    window.Scene.EventView = Backbone.View.extend({
        el: ".event",
        initialize: function () {
            _.bindAll(this,"onPhotoCreate","onPhotoUpdate");

            this.listenTo(this.model, 'change', this.render);
            this.photo_views = {};

            this.model.get("photos").forEach(this.onPhotoCreate);
        },
        onPhotoCreate : function (photo) {
            var view = new window.Scene.PhotoView({model : new window.Scene.Photo(photo)});
            this.$el.append(view.$el);
            this.photo_views[photo._id] = view;
        },
        onPhotoUpdate : function (photo) {
            this.photo_views[photo._id].model.set("position",photo.position);
        },
        registerWSEvents : function (socket) {
            socket.on("Photo.create",this.onPhotoCreate);
            socket.on("Photo.update",this.onPhotoUpdate);
        },
        render : function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    (function connectWS() {
        var socket = null;
        if (window.Scene.socket == null) {
            socket = io.connect("/event");
            socket.on("connect", function () {
                socket.emit("joinRoom",{event:"<%=event._id%>"});
            });
            socket.on('message', function (data) {});
            socket.on('disconnect', function () {});

            window.Scene.eventView.registerWSEvents(socket);
        }
        socket.socket.connect();
        window.Scene.socket = socket;
    })();

    $.fn.get2dContext = function () {
        return this[0].getContext("2d");
    };
    $.fn.resizeContext = function () {
        $(this)[0].width  = $(this).width();
        $(this)[0].height = $(this).height();
    };

    $(function () {
        $("#photo_input_button").click(function () {
            $("#photo_input").click();
        });

        $("#photo_input").change(function () {
            var fileReader = new FileReader();

            var file = this.files[0];
            window.mpImg = new MegaPixImage(file);

            var canvas = document.getElementById('photo_preview');

            var maxWidth    = $(".canvas_container").width(),
                maxHeight   = $(".canvas_container").height();

            window.mpImg.render(canvas, { maxWidth: maxWidth, maxHeight : maxWidth });

            $("#create_photo_modal").modal('show');

            window.Scene.image_loaded = true;
        });

        $("#use_photo").click(function () {
            if(window.Scene.image_loaded) {
                $("#create_photo_modal").modal('hide');
                alert("click a location for photo");
                window.Scene.wait_for_photo_location = true;
            }
            window.Scene.image_loaded = false;
        });

        $("#cancel_photo").click(function () {
            if(window.Scene.image_loaded) {
                $("#create_photo_modal").modal('hide');
                window.Scene.wait_for_photo_location = false;
            }
            window.Scene.image_loaded = false;
        });


        $(".event").click(function (event) {
            if(window.Scene.wait_for_photo_location) {
                var target_url = $("#photo_preview")[0].toDataURL();
                if (target_url) {
                    var size = {
                        width  : $("#photo_preview").width()  / $(".event").width() * 100,
                        height : $("#photo_preview").height() / $(".event").height() * 100
                    };
                    var maxSize = 17;
                    if(size.width > size.height) {
                        if(size.width > maxSize) {
                            var scale = maxSize / size.width;
                            size.width *= scale;
                            size.height *= scale;
                        }
                    } else {
                        if(size.height > maxSize) {
                            var scale = maxSize / size.height;
                            size.width *= scale;
                            size.height *= scale;
                        }
                    }

                    window.Scene.socket.emit("Photo.create", {
                        position : {
                            x: ( event.offsetX - $(".canvas_container").width()/2) / $(".event").width() * 100,
                            y: ( event.offsetY - $(".canvas_container").width()/2) / $(".event").height() * 100
                        },
                        size : size,
                        image: target_url
                    });
                    target_url = null;
                } else {
                    alert("no targeturl");
                }
                window.Scene.wait_for_photo_location = false;
            }
        });

        $(window).resize(function () {
            $(".event-container").height( $("body").height() - $(".navbar").height());
            var width = $("body").width();
            var height = $(".event-container").height();
            console.log(width, height);
            if(width < height) {
                $(".event").width(width);
                $(".event").height(width);
            } else {
                $(".event").width(height);
                $(".event").height(height);
            }
        });

        $(window).resize();

        window.Scene.eventView = new window.Scene.EventView({
            model : new window.Scene.Event(window.Scene.event)
        });

        window.Scene.photoDetailView = new window.Scene.PhotoDetailView();

        $(".event-container").css("background-image","url('" + "/backgrounds/" + (Math.floor(Math.random() * 15) + 1) + ".png')");
    });
})(jQuery);
