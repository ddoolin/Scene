window.Scene.HomeController = function () {

    // Variable decs
    var that = this;

    this.createMap = function (position) {
        localStorage.setItem("currentLatitude", position.coords.latitude);
        localStorage.setItem("currentLongitude", position.coords.longitude);

        var lat = position.coords.latitude,
              lng = position.coords.longitude,
              map,
              mapOptions;

        // Options to pass to the map
        mapOptions = {
            center: new google.maps.LatLng(lat, lng),
            zoom: 14,
            streetViewControl: false,
            panControl: false,
            mapTypeControl: true,
            zoomControlOptions: {
                position: google.maps.ControlPosition.LEFT_CENTER
            },
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
        window.Scene.map = map;

        marker = that.createColoredMarker("yellow", [lat, lng]);

        that.populateMap();
    };

    this.formatDate = function (date) {

        // Change from "Wed May 29 2013" to "Wednesday, May 29, 2013" and return
        var date = new Date(date),
            days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday",
                "Friday", "Saturday"],
            day = days[date.getDay()],
            months = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];
            month = months[date.getMonth()],
            monthDay = date.getDate(),
            year = date.getFullYear(),
            formattedDate = day + ", " + month + " " + monthDay + ", " + year;

        return formattedDate;
    }

    this.formatTime = function (date) {

        // Change from "23:0" to "11:00 PM" and return
        var date = new Date(date),
            hour = date.getHours(),
            minutes = date.getMinutes(),
            meridiem = "am",
            formattedTime;

        if (hour > 12) {
            hour = hour - 12,
            meridiem = "pm";
        } else if (hour === 12) {
            meridiem = "pm";
        } else if (hour === 0) {
            hour = 12;
            meridiem = "am";
        }

        formattedTime = hour + ":" + (((minutes < 10) ? "0" : "") + minutes) + " " + meridiem;

        return formattedTime;
    };

    this.createMarker = function (position) {
        var position = (position == undefined) ? new google.maps.LatLng(37.525, 127.000) : new google.maps.LatLng(position[0], position[1]),
              marker;

        marker = new google.maps.Marker({
            map: window.Scene.map,
            position: position,
            draggable: false,
            animation: google.maps.Animation.DROP
        });

        return marker;
    };

    this.createColoredMarker = function (color, position) {
        var position = (position == undefined) ? new google.maps.LatLng(37.525, 127.000) : new google.maps.LatLng(position[0], position[1]),
            marker,
            image,
            shadow;

        image = new google.maps.MarkerImage("images/" + color + "-marker.png",
            new google.maps.Size(32, 32),
            new google.maps.Point(0, 0),
            new google.maps.Point(12, 32));

        shadow = new google.maps.MarkerImage("images/marker-shadow.png",
            new google.maps.Size(40, 37),
            new google.maps.Point(0, 0),
            new google.maps.Point(12, 32));

        marker = new google.maps.Marker({
            map: window.Scene.map,
            position: position,
            draggable: true,
            animation: google.maps.Animation.DROP,
            shadow: shadow,
            icon: image
        });

        window.Scene.map.setCenter(position);

        return marker;
    };

    this.createInfoWindow = function (marker, event) {
        var markup = "<div class='content'>";

            if (event.image) {
                markup += "<img src='" + event.image + "' class='photo' />";
            }

            markup += "<a class='first-heading' href='/events/" + event._id +  "''>" + event.name +
                "</a><div class='body-content'>" +
                "<p class='time'>" + that.formatDate(new Date(event.duration.starttime)) +
                " @ " + that.formatTime(new Date(event.duration.starttime)) + "</p>";

            if (window.Scene.user) {
                markup += "<p class='description logged'>" + event.description + "</p>" +
                "<a class='attend-event' href='#'>Attend this event</a>";
            } else {
                markup += "<p class='description'>" + event.description + "</p>";
            }

            markup += "</div></div>";

        google.maps.event.addListener(marker, "click", function () {
            window.Scene.infoWindow.setContent(markup);
            window.Scene.infoWindow.open(window.Scene.map, this);
            $(".attend-event").on("click", function (evt) {
                evt.preventDefault();

                window.socket.emit("User.attendEvent", {
                    user: window.Scene.user._id,
                    event: event._id
                });

                that.addAttendingEvent(event);
            });
        });
    };

    this.populateMap = function () {
        var events = window.Scene.events;

        _.each(window.Scene.events, function (event) {
            marker = that.createMarker([event.location.latitude, event.location.longitude]);
            that.createInfoWindow(marker, event);
        });
    };

    this.setDefaultTimes = function () {
        var date = new Date(),
            hour = date.getHours() + 1;

        $("#from_date").val((date.getMonth() + 1) + "/" + ((hour >= 24) ? date.getDate() + 1 : date.getDate()) + "/" + date.getFullYear());
        $("#to_date").val((date.getMonth() + 1) + "/" + (((hour + 1) >= 24) ? date.getDate() + 1 : date.getDate()) + "/" + date.getFullYear());

        $("#from_time").val(((hour > 12) ? hour - 12 : hour) + ":00 " + ((hour === 24 || hour < 12) ? "am" : "pm"));
        $("#to_time").val(
            (((hour + 1) > 12)
            ? ((hour + 1) > 24)
                ? Math.ceil((hour + 1) / 2) - 12
                : (hour + 1) - 12
            : (hour + 1)) + ":00 " + (((hour + 1) >= 24 || (hour + 1) < 12) ? "am" : "pm")
        );
    };

    this.findOnMap = function () {
        var geocoder = new google.maps.Geocoder(),
              modal = $("#create_event_modal"),
              locationFinder = $("#location_finder_popup"),
              position,
              marker;

        $(".create-event-btn").hide();
        modal.modal("hide");
        locationFinder.fadeIn(600);

        locationFinder.draggable({
            containment: "parent"
        }).draggable("enable");

        setTimeout(function () {
            position = [window.Scene.map.getCenter().lat(), window.Scene.map.getCenter().lng()];
            marker = that.createColoredMarker("blue", position);

            google.maps.event.addListener(marker, "dragend", function () {
                geocoder.geocode({
                    "latLng": marker.getPosition()
                }, function (results, status) {
                    $("#address").val(results[0].formatted_address);
                });
            });
        }, 500);

        $("#find_address").click(function (event) {
            errorBadge = $("#location_finder_popup .badge");
            address = $("#address").val();

            // Badge collapses if no text value
            errorBadge.text("").tooltip("destroy");

            if (address.length < 3) {
                errorBadge.text("!");
                errorBadge.tooltip({
                    title: "Address too short",
                    placement: "left"
                });
                return false;
            }

            geocoder.geocode({
                "address": address
            }, function (results, status) {
                if (status !== "OK" && status !== "ZERO_RESULTS") {
                    errorBadge.text("!");
                    errorBadge.tooltip({
                        title: "Unknown error",
                        placement: "left"
                    });
                    return false;
                } else if (status === "ZERO_RESULTS") {
                    errorBadge.text("!");
                    errorBadge.tooltip({
                        title: "Address not found",
                        placement: "left"
                    });
                    return false;
                }

                marker.setPosition(results[0].geometry.location);
		window.Scene.map.setCenter(results[0].geometry.location);
            });
        });

        $("#accept_address").click(function (event) {
            $("#event_location").val($("#address").val());
            marker.setMap(null);
            modal.modal("show");
            $(".create-event-btn").show();
            locationFinder.fadeOut();
        });

        $("#cancel_finder").click(function (event) {
            event.preventDefault();
            $("#address").val("");

            marker.setMap(null);
            modal.modal("show");
            $(".create-event-btn").show();
            locationFinder.fadeOut();
            locationFinder.draggable("disable");
        });
    };

    this.createEvent = function () {
        var geocoder = new google.maps.Geocoder(),
              event = {
                _creator: window.Scene.user._id,
                name: $("#event_name").val(),
                image: $("#event_photo").val(),
                description: $("#event_description").val(),
                address: $("#event_location").val(),
                duration: {
                    starttime: new Date($("#from_date").val() + " " + $("#from_time").val()),
                    endtime: new Date($("#to_date").val() + " " + $("#to_time").val())
                }
            };

        geocoder.geocode({
            "address": event.address
        }, function (results, status) {
            event.location = {
                latitude: results[0].geometry.location.lat(),
                longitude: results[0].geometry.location.lng()
            };

            window.socket.emit("Event.create", event);
            $("#create_event_modal").modal("hide");
        });
    };

    this.createUser = function () {
        var data = {
            name: $("#signup_username").val(),
            email: $("#signup_email").val(),
            password: $("#signup_password").val()
        };

        $.ajax({
            url: "/register",
            method: "POST",
            data: data,
            success: function (data, textStatus, jqXHR) {
                window.location.href = "/";
            },
            error: function () {
                console.log("Error");
            }
        });
    };

    this.attemptLogin = function () {
        console.log("Here");
    };

    this.addAttendingEvent = function (event) {
        var markup = "<div class='event'>" +
            "<div class='event-name'><a href='/events/" + event._id + "'>" + event.name + "</a></div>" +
            "<div class='event-duration'>" + moment(event.duration.starttime).format("MM/DD h:mma") +
            " ~ " + moment(event.duration.endtime).format("MM/DD h:mma") + "</div>" +
            "<div class='event-location'>" + event.address + "</div></div>";

        $("#sidebar .events").prepend(markup);
    };

    this.addSpot = function () {
        if ($(".spot-text").val()) {
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({
                "address": $(".spot-text").val()
            }, function (results, status) {
                if (results) {
                    var data = {
                        user: window.Scene.user._id,
                        spot: {
                            latitude: results[0].geometry.location.lat(),
                            longitude: results[0].geometry.location.lng(),
                            address: results[0].formatted_address
                        }
                    };

                    window.socket.emit("User.addSpot", data);
                }
            });
        }
    };

    this.renderSpot = function (spot) {
        var spot = spot.spot,
              markup = "<div class='spot'><a class='spot-address' href='#' data-lat='" + spot.latitude +
            "' data-lng='" + spot.longitude + "'>" + spot.address + "</a></div>";

        $("#sidebar .spots").prepend(markup);
        el = $("#sidebar .spot").get(0)
	el = $(el).find(".spot-address");
        $(el).click(function (event) {
            event.preventDefault();

            that.centerSpot($(el).data("lat"), $(el).data("lng"));
        });
    };

    this.centerSpot = function (lat, lng) {
	console.log(lat, lng);
        var latLng = new google.maps.LatLng(lat, lng);

        window.Scene.map.setCenter(latLng);
    };
};
;(function ($) {
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
;(function ($) {

    var scene = window.Scene,
          hc = new scene.HomeController();

    (function getLocation () {
        if (Modernizr.geolocation) {
            if (localStorage.getItem("currentLatitude") && localStorage.getItem("currentLongitude")) {
                var latitude = localStorage.getItem("currentLatitude"),
                      longitude = localStorage.getItem("currentLongitude"),
                      position = {
                          coords: {
                              latitude: latitude,
                              longitude: longitude
                          }
                      };

                hc.createMap(position);
            } else {
                navigator.geolocation.getCurrentPosition(hc.createMap);
            }
        } else {
            console.log("Geolocation API not supported");
        }
    })();

    (function connectWS () {
        var socket = window.socket = null;

        if (socket === null) {
            socket = io.connect("/home");
            socket.on("connect", function() {});
            socket.on('message', function(data) {});
            socket.on('disconnect', function() {});
            socket.on("Event.create", function (event) {
                marker = hc.createColoredMarker("green", [event.location.latitude, event.location.longitude]);

                hc.createInfoWindow(marker, event);
            });
            socket.on("User.addSpot", function (spot) {
                hc.renderSpot(spot);
            });
        }

        socket.socket.connect();
        window.socket = socket;
    })();

    (function setSidebarTimes () {
        _.each($("#sidebar .event-duration"), function (time) {
            // Check year later and show only if it's not the same as the current year
            var el = $(time).get(0),
                  startTime = moment($(el).data("start-time")).format("MM/DD, h:mma"),
                  endTime = moment($(el).data("end-time")).format("MM/DD, h:mma");

            $(el).text(startTime + " ~ " + endTime);
        });
    })();

    (function setEventHandlers () {
        // Instantiate the login popover
        $("#login").popover({
            html: true,
            placement: "bottom",
            content: function () {
                return $("#login_popover_content").html();
            }
        });

        // Close registration modal
        $("#cancel_registration").click(function (event) {
            event.preventDefault();

            $("#registration_modal").modal("hide");
        });

        // Create new user submit
        $("#user_submit").click(function (event) {
            event.preventDefault();

            hc.createUser();
        });

        // Instantiate the datepickers
        $("#from_date").datepicker({
            minDate: new Date(),
            altField: $("#from_date"),
            dateFormat: "m/d/yy"
        });

        $("#to_date").datepicker({
            minDate: new Date(),
            altField: $("#to_date"),
            dateFormat: "m/d/yy"
        });

        // Set the focus handler
        $("#from_time, #to_time").focus(function (event) {
            $(event.target).siblings(".hour-select").show();
        }).keydown(function (event) {
            $(event.target).siblings(".hour-select").hide();
        }).blur(function (event) {
            $(event.target).siblings(".hour-select").hide();
        });

        // Set the default times (pretty complex, needs own method)
        hc.setDefaultTimes();

        // Set hour text on click
        $(".hour").mousedown(function (evt) {
            parentInput = $(evt.target).parent().siblings().get(1);
            $(parentInput).val($(evt.target).text());
        });

        // Focus text field on modal show
        $("#create_event_modal").on("shown", function () {
            $("#event_name").focus();
        });

        // Create new event click
        $("#event_submit").click(function (event) {
            event.preventDefault();

            hc.createEvent();
        });

        // Find on Map button click
        $("#find_location").click(function (event) {
            event.preventDefault();

            hc.findOnMap();
        });

        // Tab switching
        $(".spots-container").height($("#sidebar").height() - 36);

        $(".attending-tab").click(function (event) {
            $(".spots-tab").removeClass("active");
            $(".attending-tab").addClass("active");

            $(".spots").hide();
            $(".events").show();
        });

        $(".spots-tab").click(function (event) {
            $(".attending-tab").removeClass("active");
            $(".spots-tab").addClass("active");

            $(".events").hide();
            $(".spots").show();
        });

        // Adding spots
        $("#add_spot").click(function (event) {
            event.preventDefault();

            hc.addSpot();
        });

        // Clicking spots
        $(".spot-address").click(function (event) {
            event.preventDefault();

            hc.centerSpot($(event.target).data("lat"), $(event.target).data("lng"));
        });
    })();
})(jQuery);
;(function ($) {
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
})(jQuery);;(function ($) {
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