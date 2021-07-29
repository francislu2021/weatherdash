let map;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 8,
  });
  var input = document.getElementById('searchInput');
    map.controls[google.maps.ControlPositon.Top_LEFT].push(input);

    var autocomplete = new google.maps.places.autocomplete(input);
    autocomplete.bindTo('bounds', map)

    var infowindow = new google.maps.infowindow();
    var marker = new google.maps.Marker({
    map: map,
    anchorPoint: new google.maps.Point(0, -29)
});

autocomplete.addListener('place_changed', function(){
    infowindow.close();
    marker.setVisible(false)
    var place = autocomplete.getPlace();
    if (!place.gepmetry) {
        window.alert("autocomplete's returned place contains no geometry, oops!");
        return;
    }

//if the place has a geometry, then present it on a map.
if (place.geometry.viewpoint) {
    map.fitBounds(place.geometry.viewpoint);
}else{
    map.setCenter(place.geometry.location);
    map.setZoom(17);
}
marker.setIcon(({
URL:place.icon,
size: new google.maps.Size(71,71),
origin: new google.maps.Point(0,0),
anchor: new google.maps.Point(17,34),
scaledSize: new google.maps.Size(35, 35)
}));
marker.setPosition(place.geometry.location);
marker.setVisible(true);

var address = '';
if (place.address_components) {
    address = [
        (place.address_components[0] && place.address_components[0].short_name || ''),
        (place.address_components[1] && place.address_components[1].short_name || ''),
        (place.address_components[2] && place.address_components[2].short_name || '')
        
    ].join(' ');
}

infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
infowindow.open(map, marker);

//location details
for (var i=0; i<place.address_components.length; i++) {
    if(place.address_components[i].types[0] == 'postal_code'){
        document.getElementById('postal_code').innerHTML = place.address_components[i].long_name;
    }
    if(place.address_components[i].types[0] == 'country') {
        document.getElementById('country').innerHTML = place.address_components[i].long_name;
    }
}
document.getElementById('location').innerHTML = place.formatted_address;
document.getElementById('lat').innerHTML = place.geometry.location.lat();
document.getElementById('lon').innerHTML = place.geometry.location.lon();
});
}


$(document).ready(function() {
    //used in url to gain JSON data from DarkSky API
    var lon;
    var lat;

    //Farhenheit and Celsius temps
    var fTemp;
    var cTemp;

    //hold the icon type
    var icon;

    //all attributes that will be filled from API and displayed on page
    var humidity;
    var precipitation;
    var description;
    var windSpeed;
    var iconURL;
    var location;

    //used in 7 day forecast, stores high and low temp as well as icon type
    function Day(low, high, icon){
        this.low = low;
        this.high = high;
        this.icon = icon;
    };

    //Day objects will be pushed to this array
    var forecast = [];

    //stores the url's of each icon
    var background = {    "clear-day": "https://cdn4.iconfinder.com/data/icons/fitness-vol-2/48/65-512.png",
                          "clear-night": "https://cdn1.iconfinder.com/data/icons/weather-18/512/blue_sky_at_night-512.png",                               "partly-cloudy-day":"http://icons.iconarchive.com/icons/icons8/android/512/Weather-Partly-Cloudy-Day-icon.png",
                          "partly-cloudy-night": "http://icons.iconarchive.com/icons/icons8/android/512/Weather-Partly-Cloudy-Night-icon.png",
                          "cloudy": "https://image.flaticon.com/icons/png/512/51/51728.png",
                          "rain": "http://icons.iconarchive.com/icons/icons8/ios7/256/Weather-Little-Rain-icon.png",
                          "sleet": "http://icons.iconarchive.com/icons/icons8/windows-8/512/Weather-Sleet-icon.png",
                          "snow": "https://d30y9cdsu7xlg0.cloudfront.net/png/64-200.png",
                          "wind": "https://d30y9cdsu7xlg0.cloudfront.net/png/7702-200.png",
                          "fog": "https://cdn4.iconfinder.com/data/icons/wthr/32/659098-cloud-fog-512.png"}

    //if geolocation is found
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
        lat = position.coords.latitude;
        lon = position.coords.longitude;

        //concat lat and long values into api url
        var url =
            "https://api.darksky.net/forecast/24dad8747ac3e7a30ffcb8daada64f96/" +
            lat +
            "," +
            lon +
            "?callback=?";
          
          console.log(url);

        //url for the google location API
        var address_url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lon + "&key=AIzaSyBdnp8x3XrCjeJDlUJCMgI4zcfA_Zmm9Z0";

        //change location text
        $.getJSON(address_url, function(address_data) {
            location = address_data.results[4].formatted_address;
            $('#location').text(location);

        });

        $.getJSON(url, function(data) {
            fTemp = Math.round(data.currently.temperature);
            icon = data.currently.icon;
            description = data.currently.summary;
            windSpeed = data.currently.windSpeed;
            cTemp = Math.round((fTemp - 32) * (5/9));
            humidity = data.currently.humidity;
            precipitation = data.currently.precipProbability;

            for(var i = 0; i < 7; i++){
                var forecast_icon = data.daily.data[i+1].icon;
                var low = Math.round(data.daily.data[i+1].temperatureMin);
                var high = Math.round(data.daily.data[i+1].temperatureMax);

                for(var key in background){
                    if(key === forecast_icon){
                    forecast_icon = background[key];
                    }
                }

                var new_day = new Day(low, high, forecast_icon);

                forecast.push(new_day);
            }

            $('#f').click(function(){
                $('#f').addClass('btn-primary');
                $('#c').removeClass('btn-primary');
                $('#temp').text(fTemp + ' degrees');
            });

            $('#c').click(function(){
                $('#c').addClass('btn-primary');
                $('#f').removeClass('btn-primary');
                $('#temp').text(cTemp + ' degrees');
            });

            if($('#f').hasClass('btn-primary')){
                $('#temp').text(fTemp + ' degrees');
            }

            else{
                $('#temp').text(cTemp + ' degrees');
            }


            $('#windSpeed').text('Wind Speed: ' + windSpeed + ' mph' );
            $('#description').text(description);
            $('#humidity').text('Humidity: ' + humidity);
            $('#precipitation').text('Precipitation: ' + precipitation + '%');

            for(var key in background){
                if(key === icon){
                    iconURL = background[key];
                }
            }

            $('#img').append("<img src = '" + iconURL + "' class = 'icon'>");


            for(var j = 0; j < 7; j++){
              $('#forecast').append('<div class = "col-sm-1 forecast_box"><img src = ' + forecast[j].icon + ' class = "forecast_icon"><p>' + forecast[j].low + '/' + forecast[j].high + '</p></div>');
            }
        });
    });
    }

    else
        alert("No Geolocation found");
  
  
  // Styles for map
    // https://developers.google.com/maps/documentation/javascript/styling
    let styles = [

        // Hide Google's labels
        {
            featureType: "all",
            elementType: "labels",
            stylers: [
                {visibility: "off"}
            ]
        },

        // Hide roads
        {
            featureType: "road",
            elementType: "geometry",
            stylers: [
                {visibility: "off"}
            ]
        }

    ];

    // Options for map
    // https://developers.google.com/maps/documentation/javascript/reference#MapOptions
    let options = {
        center: {lat: 41.3184, lng: -72.9318}, // New Haven, CT
        disableDefaultUI: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        maxZoom: 14,
        panControl: true,
        styles: styles,
        zoom: 13,
        zoomControl: true
    };

    // Get DOM node in which map will be instantiated
    let canvas = $("#map-canvas").get(0);

    // Instantiate map
    map = new google.maps.Map(canvas, options);

    // Configure UI once Google Map is idle (i.e., loaded)
    google.maps.event.addListenerOnce(map, "idle", configure);



});
