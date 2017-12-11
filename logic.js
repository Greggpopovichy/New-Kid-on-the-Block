
$(document).ready(function() {

// EP - initialize firebase
    var config = {
        apiKey: "AIzaSyCDcC5j0NdM18LWvAaBkkHSQwVtWwYU_-g",
        authDomain: "new-kid-on-the-block-3ba2b.firebaseapp.com",
        databaseURL: "https://new-kid-on-the-block-3ba2b.firebaseio.com",
        projectId: "new-kid-on-the-block-3ba2b",
        storageBucket: "new-kid-on-the-block-3ba2b.appspot.com",
        messagingSenderId: "216603995189"
    };

    firebase.initializeApp(config);

//initialize variables
    var database = firebase.database();
    var address = localStorage.getItem("address");
    var city = localStorage.getItem("city");
    var state = localStorage.getItem("state");
    var zip = localStorage.getItem("zip");
    var name = localStorage.getItem("name");
    var latitude;
    var longitude;
    var MeetUpCategories = ["sports-fitness", "arts-culture", "beliefs", "book-clubs", "career-business", "dancing", "parents-family", "fashion-beauty", "film", "food", "health-wellness", "hobbies-crafts", "lgbtq", "language", "education", "movements", "music", "outdoors-adventure", "pets", "photography", "games-sci-fi", "social", "tech", "writing"];
    var exploreCategories = ["restaurants", "museums", "movies", "coffee", "fun", "nightlife", "shopping", "hiking", "sports", "outdoors", "gyms"];
    var jobCategories = ["developer", "marketing", "designer", "sales", "systems+analyst", "business+analyst", "systems+engineer", "ERP"];
    var radius = 25;
    var clickCounter = 0;

    //Display Images of cities using masonry.js
    var ajaxModule = function(){};
        ajaxModule.prototype = {
            iterator: 1,
            masonryTimeoutClear: "",

            init: function(request, callback) {
                var self = this;

                self.iterator++;

                request = encodeURIComponent(request.trim());
                this.callAjax(request, callback);

                $(".wrapper").html("").hide();
                // $(".loading").show();
            },

            callAjax: function(request, callback) {
                var self = this;

                var ajaxRequest = $.ajax({
                    url: "https://pixabay.com/api/?username=epozhiltsova01&key=6597467-0968f6256430f97ec5a721957&q=" + request + "&image_type=photo",
                    success: function(response) {
                        self.parseResponse(response);
                    },
                    error: function(response) {
                        console.log(response);
                    }
                });

                ajaxRequest.then(function() {
                    if(callback) {
                        callback();
                    }
                })
            },

            parseResponse: function(response) {
                var self = this;

                //console.log(response.hits);
                $.each(response.hits, function(index, value) {
                    $(".wrapper").prepend("<div class='image image" + index + "' style='width:" + (value.webformatWidth * .75) + "px; height:" + (value.webformatHeight * .75) + "px; background: url(" + value.webformatURL + ");'><a href='" + value.pageURL + "' target='_blank'><div class='overlay'></div></a><div class='hidden'></div></div>");
                    // $(".image"+index+" .hidden").append("<div>User: <b>" + value.user + "</b></div><div>Tags: <b>" + value.tags + "</b></div><div class='stats'><i class='fa fa-eye'></i> <b>" + value.views + "</b> &nbsp; <i class='fa fa-thumbs-o-up'></i> <b>" + value.likes + "</b></div><div class='direct-links'><a href='" + value.webformatURL + "' target='_blank'><i class='fa fa-link'></i>  Direct Link</a> <a href='" + value.webformatURL + "' download><i class='fa fa-download'></i> Download</a></div>");
                    // $(".image"+index+" .hidden").append("<div class='direct-links'><a href='" + value.webformatURL + "' target='_blank'><i class='fa fa-link'></i>  Direct Link</a> <a href='" + value.webformatURL + "' download><i class='fa fa-download'></i> Download</a></div>");
                });

                clearTimeout(self.masonryTimeoutClear);
                self.masonryTimeoutClear = setTimeout(self.runMasonry, 500);
            },

            runMasonry: function() {
                //destroy and then rebuild it
                if($(".wrapper").masonry().length > -1) {
                    $(".wrapper").masonry("destroy");
                }

                $(".wrapper").masonry({
                    itemSelector: '.image',
                    isFitWidth: true,
                    gutter: 0
                });

                // $(".loading").hide();
                $(".wrapper").show();
            }
        };

        var newModule = new ajaxModule();

        $(function() {
            //newModule.init("", callback);
            newModule.init(city);
        });

        var timeoutClear;
        // $(".searchInput").keyup(function() {
        var keyword = $(this).val().toLowerCase();

        clearTimeout(timeoutClear);
        timeoutClear = setTimeout(function() {

            if(city || !city === "undefined") {
                newModule.init(city);
            }
        },1000);




//NL Run google geocode API to retrieve latitude and longitude from user's address. This is needed for meetup API

    var geoCodeURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + address + ",+" + city + ",+" + state + "&key=AIzaSyDB3dL-UoNQrilY--0ze7PI_s4bKmnwQZQ";
    console.log(geoCodeURL);

    $.ajax({
        url: geoCodeURL,
        method: 'GET'
    }).done(function (response) {
        console.log(response);
        latitude = response.results[0].geometry.location.lat;
        longitude = response.results[0].geometry.location.lng;

        console.log(latitude);
        console.log(longitude);
        localStorage.setItem("latitude", latitude);
        localStorage.setItem("longitude", longitude);
    });

    latitude = localStorage.getItem("latitude");
    longitude = localStorage.getItem("longitude");


    //adding Firebase. Loop through each child and count how many times the city appears while incrementing count variable.
    //count variable = amount of people moving to that city

    database.ref().on("child_added", function(snapshot) {
        // storing the snapshot.val() in a variable for convenience
        var sv = snapshot.val();
        var getCity = sv.city;

        if(getCity === city){
            clickCounter++;
        }

        // Handle the errors
    }, function(errorObject) {
        console.log("Errors handled: " + errorObject.code);
    });



    //Populate Drop Down menus with categories

    for (i = 0; i < MeetUpCategories.length; i++) {

        var newItem = $("<li>");
        newItem.addClass("meetup");
        newItem.attr("value", MeetUpCategories[i]);
        newItem.html("<a href= '#!'>" + MeetUpCategories[i] + "</a>");
        $("#meetUpDropDown").append(newItem);

    }


    for (i = 0; i < exploreCategories.length; i++) {
        var newItem = $("<li>");
        newItem.addClass("explore");
        newItem.html("<a href= '#!'>" + exploreCategories[i] + "</a>");
        $("#ExploreDropDown").append(newItem);

    }

    for (i = 0; i < jobCategories.length; i++) {
        var newItem = $("<li>");
        var job = jobCategories[i];
        job = job.split('+').join(' ');
        newItem.addClass("findJob");
        newItem.html("<a href= '#!'>" + job + "</a>");
        $("#jobDropDown").append(newItem);

    }

    //EP - Weather Underground API. Add weather and name to header of page
    $.ajax({
        url: "http://api.wunderground.com/api/b2f01d8788315282/geolookup/conditions/q/" + state + "/" + city + ".json",
        dataType: "jsonp"
    })
        .done(function (response) {
            console.log('response: ', response);
            var location = response.location.city;
            console.log('location: ', location);
            var temp_f = response.current_observation.temp_f;
            console.log('temp_f: ', temp_f);


            //make var name=   ; - after grabbing info from the form
            $("#addWeather").append(name);
            $("#addWeather").append("<br>");
            $("#addWeather").append("Current temperature in " + location + " is: " + temp_f + "F");
            console.log("Current temperature in " + location + " is: " + temp_f + "F");


            $("#insertFirebase").append(clickCounter + " other people are moving to " + city + "!");
    });
    
    //Meetup API to display events and meetups
    $('.meetup').click(function () {
        $("#title").empty()
        var getCategory = $(this).text();

        var meetupURL = "https://api.meetup.com/find/events?&sign=true&photo-host=public&lon=" + longitude + "&text=" + getCategory + "&radius=" + radius + "&lat=" + latitude + "&key=5b3e58166d3244c6e6073631c276059";

        console.log(meetupURL);
        $.ajax({
            url: meetupURL,
            method: 'GET',
            dataType: "jsonp"
        }).done(function (response) {
            console.log(response);

            for(var i = 0; i < 20; i++) {
                var results = response.data[i];
                console.log(results);
                var name = results.name;
                var groupName = results.group.name;
                var location = results.group.localized_location;
                var url = results.link;
                var description = results.description;
                console.log(url);
                var addLi = $("<li>");
                var addHeader = $("<div>");
                var addBody = $("<div>");
                addHeader.addClass("collapsible-header");
                addHeader.css("color", "black");
                addBody.addClass("collapsible-body");
                //addLi.addClass("cyan darken-2")
                addLi.css("text-align", "center");
                addLi.css("padding", "5px");
                //addLi.css("width", "75%");
                addLi.css("display", "block");
                addLi.css("background-color", "#0197a6");
                addLi.css("color", "white");

                $(addHeader).html("<h5>" + groupName + "</h5>");

                $(addBody).append("<h6>" + name + "</h6>");
                console.log(url);
                $(addBody).append("<a href='" + url + "'>website</a>");

                $(addBody).append("<h6>" + location + "</h6>");

                $("#title").append(addLi);
                addLi.append(addHeader);
                addLi.append(addBody);
                //$('.collapsible').collapsible();
            }
        });
    });

    //foursquare api to display things to do
    $(".explore").on("click", function () {
        $("#title").empty()
        var getCategory = $(this).text();
        var fourSquareKEY = "KY3TA5KDHJ2GSHB33L24MFU53CL2POJKG1MTTXQGB12BVVQP";
        var fourSquareSecret = "21VI4B3WJIDL2MHIW2EB5IJOQGTGHQK4PQGNRML4RCAZDQZZ";
        var fourSquareURL = "https://api.foursquare.com/v2/venues/explore?ll=" + latitude + "," + longitude +"&radius=10000&client_id=" + fourSquareKEY + "&client_secret=" + fourSquareSecret + "&v=20171015&intent=browse&limit=15&query=" + getCategory;

        $.ajax({
            url: fourSquareURL,
            method: "GET",
            dataType: "jsonp"
        }).done(function (data) {

            console.log("Data", data);

            var items = data.response.groups[0].items;

            console.log(items);

            var venue = items.venue;

            for(var i = 0; i < items.length; i++) {

                var addLi = $("<li>");
                var addHeader = $("<div>");
                var addBody = $("<div>");
                addHeader.addClass("collapsible-header");
                addHeader.css("color", "black");
                addBody.addClass("collapsible-body");
                addLi.css("text-align", "center");
                addLi.css("padding", "5px");
                addLi.css("display", "block");
                addLi.css("background-color", "#0197a6");
                addLi.css("color", "white");

                var url = items[i].venue.url;
                var twitter = items[i].venue.contact.twitter;
                var phone = items[i].venue.contact.formattedPhone;
                var location = items[i].venue.location.address;
                var hours = items[i].venue.hours.status;

                $(addHeader).html("<h5>" + items[i].venue.name + "</h5>");

                console.log(items[i].venue.name);

                //$(addBody).append("<a>" + items[i].venue.categories[0].icon.prefix.suffix + "</a>");
                if(twitter) {
                    $(addBody).append("<h6>" + "@" + twitter + "</h6>");
                }


                if(phone) {
                    $(addBody).append("<h6>" + "Contact: " + phone + "</h6>");
                }

                if(location) {
                    $(addBody).append("<h6>" + location + "</h6>");
                }

                if(hours) {
                    $(addBody).append("<h6>" + hours + "</h6>");
                }

                if(url) {
                    $(addBody).append("<a href=" + url + ">website</a>");
                }

                $("#title").append(addLi);
                addLi.append(addHeader);
                addLi.append(addBody);
                $('.collapsible').collapsible();
            }

        });

    });

    //Dice API to display job data
    $('.findJob').click(function () {
        //put find job api here.
        $("#title").empty();
        var getCategory = $(this).text();
        var DiceURL = "http://service.dice.com/api/rest/jobsearch/v1/simple.json?text=" + getCategory + "&city=" + zip;

        $.ajax({
            url: DiceURL,
            method: 'GET'
        }).done(function (response) {

            for (var i = 0; i < 10; i++) {
                var addLi = $("<li>");
                var addHeader = $("<div>");
                var addBody = $("<div>");

                addHeader.addClass("collapsible-header");
                addHeader.css("color", "black");
                addBody.addClass("collapsible-body");
                addLi.css("text-align", "center");
                addLi.css("padding", "5px");
                addLi.css("display", "block");
                addLi.css("background-color", "#0197a6");
                addLi.css("color", "white");

                $("#title").append(addLi);
                addLi.append(addHeader);
                addLi.append(addBody);

                var results = response.resultItemList[i];
                var url = results.detailUrl;
                var jobTitle = results.jobTitle;
                var location = results.location;
                var company = results.company;
                var postedDate = results.date;

                $(addHeader).html("<h5>" + jobTitle + "</h5>");

                $(addBody).append("<h6>" + company + "</h6>");

                $(addBody).append("<h6>" + location + "</h6>");

                $(addBody).append("<h6>" + postedDate + "</h6>");

                $(addBody).append("<a href="+ url +">Apply!</a>");

                $('.collapsible').collapsible();
            }
        })
    });

});



