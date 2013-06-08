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
                hc.createColoredMarker("green", [event.location.latitude, event.location.longitude]);
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

        $(".hour").mousedown(function (evt) {
            parentInput = $(evt.target).parent().siblings().get(1);
            $(parentInput).val($(evt.target).text());
        });

        $("#create_event_modal").on("shown", function () {
            $("#event_name").focus();
        });

        $("#event_submit").click(function (event) {
            event.preventDefault();

            hc.createEvent();
        });

        $("#find_location").click(function (event) {
            event.preventDefault();

            hc.findOnMap();
        });

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
    })();
})(jQuery);