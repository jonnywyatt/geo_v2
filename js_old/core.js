
/* NEXT STEPS:
	* add loading indicators to panels
	* resizable panels w/ rounded corners
	. progressive loading of thumbnails in Flickr box
	. BBQ / storing state in hash
	
	* Allow postcodes to be entered
	. Use config objects / separate all strings and constants
	. templates to write out HTML (also centralise all strings)
	* bandwidth detection?
	. Unit testing
	. JSDoc
*/

/*
*  main.js_old
*
*/

// Place the objects within their own namespace; create it if needed.
if (!window.MVC){
	MVC = {};
}

MVC.Model = function(){
	// constants - types of connection to retrieve data
	this.CONNECT_GET = 1;
	this.CONNECT_POST = 2;
	this.CONNECT_CROSSDOMAIN = 3;
	this.CONNECT_GEOLOCATE = 4;
	this.CONNECT_NONE = 5;
	this.CONNECT_CACHE = 6;
	this.views = new Array();
	// notify the views for the first time
	this._notify();
};

/* Set the model state, either by retrieving data from remote connection, or setting state object directly */
MVC.Model.prototype.setState = function(argsObj){
	var obj = this;

	// choose connection type
	switch (argsObj.connectType){
		case this.CONNECT_GET:
			ajaxConnect(argsObj.url, 'GET', null, 'json');
			break;

		case this.CONNECT_POST:
			ajaxConnect(argsObj.url, 'POST', argsObj.dataObj, 'json');
			break;

		case this.CONNECT_CROSSDOMAIN:
			ajaxConnect(argsObj.url, 'GET', null, 'jsonp');
			break;
		
		case this.CONNECT_GEOLOCATE:
			
			//navigator.geolocation.getCurrentPosition(handleSuccess, handleFailureGeo);
			handleSuccess({
				coords: {
					latitude: 51.522482,
					longitude: 0.205779
				}					
			})
			break;
			
		case this.CONNECT_NONE:
			handleSuccess();
			break;
			
		default:
			break;
	}
		
	function ajaxConnect(url, httpMethod, dataObj, dataType){
		/*$.ajax({
			url: url,
			success: handleSuccess,
			error: handleFailure,
			data: dataObj,
			dataType: dataType,
			ifModified:true,
			timeout: 5000,
			requestType: httpMethod			
		});*/
		
		x$('body').xhr( url, {
			async: true,
			callback: handleSuccess,
			data: dataObj,
			requestType: httpMethod		
		});
	}

	function handleSuccess(o, textStatus, XMLHttpRequest){
	/* included the object that was passed into the model, with the response so individual views know what data they're getting and if / how to use it */
	// notify all views
    obj._notify(o, argsObj);
  }

	// TODO - proper failure handling - try to recover?
	function handleFailure(XMLHttpRequest, textStatus, errorThrown){
		alert('Connection to remote server failed: ' + textStatus);
	}

	function handleFailureGeo(PositionError){
		alert('Could not get geolocation');
	}
	
}; /* end function setState */

MVC.Model.prototype.subscribe = function(view){
		// Subscribe the view by inserting it into the list of subscribers.
		this.views.push(view);
};

MVC.Model.prototype.unsubscribe = function(view){
	var n = this.views.length;
	var t = new Array();

	// Unsubscribe the view by removing it from the list of subscribers.
	for (var i = 0; i < n; i++)	{
		if (this.views[i].id != view.id)
		t.push(this.views[i]);
	}

	this.views = t;
};

MVC.Model.prototype._notify = function(o, requestObject){
	var n = this.views.length;

	// Notifying all views means to invoke the update method of each view.
	for (var i = 0; i < n; i++)	{
		this.views[i].update(o, requestObject);
	}
};

MVC.View = function(id, model){
	this.latLon = {};
	/* constants */
	this.TYPE_GET_LATLONG = 1; /* request new lat/long using geolocation */
	this.TYPE_SET_LATLONG = 2; /* pass new lat/long to model eg if map is dragged, to update all views with it */
	this.TYPE_GET_PHOTOFEED = 3; /* retrieve list of flickr photos for given lat/long */
	this.TYPE_SET_USERID = 4; /* change flickr user id */
	
	/* store container element in a variable for fast reference in future */
	this.container = document.getElementById(id);
	if (model){
		this.attach(model);
	}
};

MVC.View.prototype.attach = function(model){
	// Make sure to unsubscribe from any model that is already attached.
	if (this.model){
		this.model.unsubscribe(this);
	}
	this.model = model;

	// Subscribe to the current model to start getting its notifications.
	this.model.subscribe(this);
};

MVC.View.prototype.update = function(o, requestObject){
	this.latLon.changed = false;
	if (requestObject.requestType === this.TYPE_GET_LATLONG){ // geolocation call
		if (!o.coords){
			alert('Geolocation could not be obtained');
			return;
		}	
		this.latLon.lat = o.coords.latitude;
		this.latLon.lng = o.coords.longitude;
		this.latLon.changed = true;
	} else if (requestObject.requestType === this.TYPE_SET_LATLONG){ // map was dragged
		this.latLon.lat = requestObject.lat;
		this.latLon.lng = requestObject.lng;
		this.latLon.changed = true;
		/*try{
			var n = o.query.results.places.place.name;
			latLon.placeName = n.split(',')[0];
		} catch(err) {
			latLon.placeName = 'Place name not found';
		}*/
	}
};

/* Constructor - view */
MVC.InputView = function(id, model){
	MVC.View.call(this, id, model);
	var self = this; 
	x$('#changeUsername').click(function(){
		self.model.setState({
			connectType: self.model.CONNECT_CROSSDOMAIN,
			requestType: self.TYPE_SET_USERID,
			url: 'http://query.yahooapis.com/v1/public/yql?q='+
				encodeURIComponent("SELECT nsid FROM flickr.people.findbyusername WHERE username='" + 
				document.getElementById('inputUser').value + "'") + '&format=json&diagnostics=false'
		});
	});
	// kick off whole process - get current position using geolocation
	self.model.setState({
		connectType: self.model.CONNECT_GEOLOCATE,
		requestType: self.TYPE_GET_LATLONG
	});
		
	/* 'Guess current location' button. 'Visitor' is a yqlgeo argument that uses a combination of W3C geolocation and IP to determine lat/long */
	//$('#navFindLoc').bind('click', function(){
		//$('#conInput').switchClass('not-started','started',500,'easeOutBounce');
		//$('#conMap').switchClass('not-started','started',500,'easeOutBounce');
		
	//});
	/*$('#navPostcode').click(function(){
		self.model.setState({
			connectType: self.model.CONNECT_CROSSDOMAIN,
			requestType: self.TYPE_GET_LATLONG,
			url: "http://query.yahooapis.com/v1/public/yql?q=USE%20'http%3A%2F%2Fmaxmanders.co.uk%2Fukgeocode%2Fukgeocode.xml'%20%20AS%20ukgeocode%3B%0ASELECT%20*%20FROM%20ukgeocode%20WHERE%20postcode%20%3D%20'"+'RM13%209L'+"'%3B&format=json&diagnostics=true"
		});	
	});
	$('#conInput').bind('click', function(){
		$(this).toggleClass('open');
		if ($(this).hasClass('open')){
			$(this).animate({height: 150}, 200);
		} else {
			$(this).animate({height: 35}, 200);	
		}
	});*/
};
MVC.InputView.prototype = new MVC.View();



MVC.InputView.prototype.update = function(o, requestObject){
	MVC.View.prototype.update.call(this, o, requestObject);
	/*if (latLon){
		this._addToLatLonHistory(latLon);
	}*/
};
/* add to history of lat/lng points visited 
MVC.InputView.prototype._addToLatLonHistory = function(latLon){
	if (!this.latLonHistory){
		this.latLonHistory = new Array;
	}
	this.latLonHistory.push(latLon);
	this._buildLatLonHistoryList();
};*/
/* build markup list of history of lat/lng points visited 
MVC.InputView.prototype._buildLatLonHistoryList = function(){
	if (this.latLonHistory.length===0){
		return;
	}
	var str='';
	var i = this.latLonHistory.length;
	var separator = (i==1)?'':'&nbsp;<&nbsp;';
	str = '<li>'+i+'. '+this.latLonHistory[i-1].placeName +'</li>';
	//str = '<li>'+this.latLonHistory[i-1].placeName +separator+'</li>';
	
	if ($('#'+this.container.id+' div.cont-history').length===0){	
		$('#'+this.container.id).append('<div class="cont-history"><h2>Locations visited</h2><ul class="latLonHistory">' + str + '</ul></div>');
	} else {
		$('#'+this.container.id+' div.cont-history ul').prepend(str);
	}
};*/
				
/* Constructor - view */
MVC.MapView = function(id, model){
	MVC.View.call(this, id, model);
	this.initialised = false;
	x$(this.container).addClass('loading');
};
/* inherit */
MVC.MapView.prototype = new MVC.View();

MVC.MapView.prototype.initialise = function() {
  this.currentPoint = new google.maps.LatLng(this.latLon.lat, this.latLon.lng);
  var myOptions = {
    zoom: 15,
    center: this.currentPoint,
    streetViewControl:true,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    navigationControl: true,
    navigationControlOptions:{
    	style: google.maps.NavigationControlStyle.DEFAULT
    }  
  };
  this.map = new google.maps.Map(document.getElementById(this.container.id), myOptions);
  this.attachHandler(this.map);
  this.initialised = true;
}
MVC.MapView.prototype.attachHandler = function(map){
	var self = this;
	/* connect handler to event fired when map has been dragged */
	google.maps.event.addListener(map, 'dragend', function() {
		/* because this event is also triggered when the map is first initialised, but we only want to handle it when the map is dragged */
		if ((self.currentPoint.lat !== this.getCenter().lat()) || (self.currentPoint.lng !== this.getCenter().lng())){
			self.currentPoint = this.getCenter();
			/* update the model of the change in lat/long, so it can update other views */
			self.model.setState({
				connectType: self.model.CONNECT_NONE,
				requestType: self.TYPE_SET_LATLONG,
				lat: self.currentPoint.lat(),
				lng: self.currentPoint.lng()//,
				//url: 'http://query.yahooapis.com/v1/public/yql?q='+encodeURIComponent('select * from flickr.places where lat='+self.currentPoint.lat()+' and lon='+self.currentPoint.lng())+'&format=json&diagnostics=false'
			});
		}
	});
}

/* Called when a change in the model takes place. Render new options */
MVC.MapView.prototype.update = function(o, requestObject){
	MVC.View.prototype.update.call(this, o, requestObject);
	/* test if data is relevant to this view */
	if (requestObject.requestType===this.TYPE_GET_LATLONG){
		if (!this.latLon.lat){
			alert('Location could not be determined');
			return;
		}
		if (!this.initialised){
			this.initialise();
		} else {
			this.currentPoint = null;
			this.currentPoint = new google.maps.LatLng(this.latLon.lat, this.latLon.lng);
			this.map.setCenter(this.currentPoint);
		}
		this.currentPoint.marker = new google.maps.Marker({  
		  position: new google.maps.LatLng(this.latLon.lat, this.latLon.lng),  
		  map: this.map  
	  });  
	  x$(this.container).removeClass('loading');
	}
};

/* Constructor - view */
MVC.PhotoView = function(id, model){
	this.userid = '';
	
	MVC.View.call(this, id, model);
	this.PHOTOS_LIMIT = 30;
	x$(this.container).addClass('loading');
	//this.largeImage();
};
/* inherit */
MVC.PhotoView.prototype = new MVC.View();

/*	MVC.PhotoView.prototype.largeImage = function(){
	var currentImgSrc = '';
			
	$('body').bind('mousemove', function(evt){
		var isCorrectTag = ((evt.target.nodeName.toLowerCase()==='img'));
		if (isCorrectTag && ($(evt.target).parents('#conPhotos a').length>0)) {
			var newImgSrc = $(evt.target).attr('src');
			img = $('#popupImage img').get(0);
			if (newImgSrc && (newImgSrc!==currentImgSrc) && img && ((!img.complete) || (img.readyState < 4))){
				$('#popupImage').remove();
				currentImgSrc = newImgSrc;
				newImgSrc = newImgSrc.substring(0, newImgSrc.indexOf('_s.jpg'))+'.jpg';
				$('<div id="popupImage"><img src=""></div>').appendTo('#conPhotos');
				$('#popupImage').addClass('loading');
				$('#popupImage img')
					.css('visibility', 'hidden')
					.load(function(){
						var w = $(this).width();
						var h = $(this).height();
						var pw = $('#popupImage').css('max-width');
						pw = parseInt(pw.substring(0, pw.indexOf('px')));
						if (w > pw){
							var aspect = w/h;
							w = pw;
							h = Math.round(pw / aspect);
							$(this).width(w);
							$(this).height(h);
						}
						var ph = $('#popupImage').css('max-height');
						ph = parseInt(ph.substring(0, ph.indexOf('px')));
						if (h > ph){
							var aspect = w/h;
							h = ph; 
							w = Math.round(ph * aspect);
							$(this).width(w);
							$(this).height(h);
						}
						$('#popupImage').width(w).height(h);
						$(this).css('visibility', 'visible');
					})
					.attr('src', newImgSrc);
					$('#popupImage').removeClass('loading');
			}
			$('#popupImage')
				.css({
					'left':evt.pageX - $('#popupImage').width() - 30,
					'top': evt.pageY - Math.round($('#popupImage').height()/2)
				});
		  img = $('#popupImage img').get(0);
			if (($('#popupImage:visible').length==0) && img && ((img.complete || img.readyState === 4))){
				$('#popupImage').fadeIn(100);
			}
		} else {
			$('#popupImage').fadeOut(100);
		}

	})
}*/

/* update photo container with new data */
MVC.PhotoView.prototype.update = function(o, requestObject){
	function buildStr( cur){
		var src = 'http://farm' + cur.farm + '.static.flickr.com/' + cur.server + '/' + cur.id + '_' + cur.secret + '_s.jpg';
		return '<li><a href=\'http://www.flickr.com/photos/' + cur.owner + '/' + cur.id + '\' target=\'_blank\' title="' + cur.title + '"><img width="75" height="75" src="' + src + '" alt="' + cur.title + '"></a></li>';
	}
		
	var userid = '';
	MVC.View.prototype.update.call(this, o, requestObject);
	if (o && (typeof o === 'string')) {
		try {
			o = JSON.parse(o);
		} catch (err){
			alert('Error parsing JSON');
			return;
		}
	}
	// render new photos
	if (requestObject.requestType===this.TYPE_GET_PHOTOFEED) {
		if (!o || !o.query || !o.query.results){
			return;	
		}

		var results = o.query.results.photo;
		if (results) {
			/* Flickr photos returned, so render. TODO - use templates */
			var str;
			str = '<h2>Flickr photos</h2><ul>';
			//out = '<h2>Photos in '+ o.query.results.places.place.name +'</h2><ul>';
			if (results.length) {
				for (var i = results.length - 1; i >= 0; i--) {
					str += buildStr(results[i]);
				}
			} else {
				str += buildStr(results);
			}
			str += '</ul>';
		} else {
			//out = 'No Flickr photos available for '+o.query.results.places.place.name;
			str = 'Nada..';
		}
		x$(this.container).removeClass('loading');
		x$(this.container).html(str);

	} else if (this.latLon.changed || (requestObject.requestType === this.TYPE_SET_USERID)){
		/* if lat/long have changed, request new photo list */
		if (requestObject.requestType === this.TYPE_SET_USERID) {
			userid = '%20user_id=%27' + o.query.results.user.nsid + '%27%20and%20';
		}
		this.model.setState({
			url: 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20flickr.photos.search(' 
				+ this.PHOTOS_LIMIT+')%20where' + userid + '%20woe_id%20in%20(%0A%20%20select%20place.woeid%20from%20flickr.places%20where%20lat%3D'
				+ this.latLon.lat +'%20and%20lon%3D'
				+ this.latLon.lng +'%0A)&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys',
			connectType: this.model.CONNECT_CROSSDOMAIN,
			requestType: this.TYPE_GET_PHOTOFEED
		});
	}
};

MVC.initialised = false;

MVC.init = function(){
	
	function updateOrientation(e) {
	    switch (e.orientation) {
            case 0: // portrait
            case 180: // portrait
        		x$(window).addClass('portrait');
                break;
            case -90: // landscape
            case 90: // landscape
        		x$(window).removeClass('portrait');
                break;  
	    }
	}
	this.model = new MVC.Model();
	/* View - map panel */
	this.mapView = new MVC.MapView('conMap', this.model);
	
	/* View - photo panel */
	this.photoView = new MVC.PhotoView('conImages', this.model);	

	/* View - input panel */
	this.inputView = new MVC.InputView('conInput', this.model);
	
	try {
		document.addEventListener("orientationChanged", updateOrientation);
	} catch(err){ }
	
	MVC.initialised = true;
};

x$(window).load(MVC.init);
try {
	document.addEventListener("deviceready", MVC.init);
} catch(err){ }

