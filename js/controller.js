var geoApp = geoApp || {};

geoApp.init = function () {
    
    geoApp.view = new geoApp.View('con-map');
    geoApp.model = new geoApp.Model();
    //TODO - add window unload to invoke geoApp.destroy
};

geoApp.mediator = {
    subscribe: function(channel, fn, context){
        if (!geoApp.mediator.channels[channel]) geoApp.mediator.channels[channel] = [];
        geoApp.mediator.channels[channel].push({ context: context, callback: fn });
        return this;
    },

    publish: function(channel){
        if (!geoApp.mediator.channels[channel]) return false;
        var args = Array.prototype.slice.call(arguments, 1);
        for (var i = 0, l = geoApp.mediator.channels[channel].length; i < l; i++) {
            var subscription = geoApp.mediator.channels[channel][i];
            subscription.callback.apply(subscription.context, args);
        }
        return this;
    },

    channels: {}

};

geoApp.destroy = function () {
    geoApp.model = null;
    geoApp.mediator = null;
};
    
