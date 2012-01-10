/**
 * Created by JetBrains WebStorm.
 * User: Jon
 * Date: 10/01/12
 * Time: 10:54
 * To change this template use File | Settings | File Templates.
 */
var geoApp = geoApp || {};

geoApp.View = function (id) {
    this.container = document.getElementById(id);
    this.map = null;
    this.markers = {};
    if (geoApp.mediator) {
        geoApp.mediator.subscribe('userChanged', this.userChanged);
    }
};

geoApp.View.prototype.userChanged = function (id, data) {
    var lat,
        lon;

    // check for args
    // get lat and lon from data. If not valid, exit
    // if map not initialised, do so and pass it lat / lon. Otherwise update user pos on map and store new marker

    if (!this.map) {
        this.initMap(lat, lon);
    } else {
        this.map.setCenter(new google.maps.LatLng(lat, lon));
    }

};

geoApp.View.updateMarker = function (lat, lon) {
    this.markers[id] = new google.maps.Marker({
        position: new google.maps.LatLng(lat, lon),
        map: this.map
    });
};

geoApp.View.prototype.initMap = function(lat, lon) {
    var myOptions = {
        zoom: 15,
        center: new google.maps.LatLng(lat, lon),
        streetViewControl:true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        navigationControl: true,
        navigationControlOptions:{
            style: google.maps.NavigationControlStyle.DEFAULT
        }
    };
    this.map = new google.maps.Map(this.container, myOptions);
};
