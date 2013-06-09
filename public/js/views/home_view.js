(function ($) {

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