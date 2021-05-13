/**
 * Directory – Directory & Listing Bootstrap 4 Theme v. 1.6.1
 * Homepage: https://themes.getbootstrap.com/product/directory-directory-listing-bootstrap-4-theme/
 * Copyright 2020, Bootstrapious - https://bootstrapious.com
 */

'use strict';

var maplayout1 = {tiles: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>', subdomains: 'abcd'}

var maplayout2 = {tiles: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png', attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia maps</a>'}

function createMap(options, places) {
    var defaults = {
        mapId: 'detailMap',
        mapZoom: 16,
        mapCenter: [51.505, -0.09],
        markerShow: true,
        markerPath: 'img/marker2.svg',
        markerPathHighlight: 'img/marker2-hover.svg',
        tileLayer: maplayout2
    };

    var settings = $.extend({}, defaults, options);

    var icon = L.icon({
        iconUrl: settings.markerPath,
        iconSize: [25, 37.5],
        popupAnchor: [0, -18],
        tooltipAnchor: [0, 19]
    });

    var highlightIcon = L.icon({
        iconUrl: settings.markerPathHighlight,
        iconSize: [25, 37.5],
        popupAnchor: [0, -18],
        tooltipAnchor: [0, 19]
    });

    var dragging = false,
        tap = false;

    if ($(window).width() > 700) {
        dragging = true;
        tap = true;
    }

    var detailMap = L.map(settings.mapId, {
        center: settings.mapCenter,
        zoom: settings.mapZoom,
        dragging: dragging,
        tap: tap,
        scrollWheelZoom: false
    });

    detailMap.once('focus', function () {
        detailMap.scrollWheelZoom.enable();
    });

    L.tileLayer(settings.tileLayer.tiles, {
        attribution: settings.tileLayer.attribution,
        minZoom: 1,
        maxZoom: 19
    }).addTo(detailMap);


    // --- add marker to map and set map bounds to include all coordinates ---

    var bounds = []
    places.forEach((place) => {
        var coords = [place.lat,place.long];
        L.marker(coords, {icon: icon, id: place.placeId})
            .on('mouseover', function (e) {
                this.setIcon(highlightIcon);
                var divid = '#' + this.options.id;
                let el = $(divid);
                el.addClass('highlightShadow')
                .removeClass('shadow');
            })
            .on('mouseout', function (e) {
                this.setIcon(icon);
                var divid = '#' + this.options.id;
                let el = $(divid);
                el.addClass('shadow')
                .removeClass('highlightShadow');
            })
            .on('click', function (e) {
                //console.log(this.options.id);
                let el = document.getElementById(this.options.id);
                el.scrollIntoView({behavior: "smooth", block: "center"});
            })
            .addTo(detailMap);
        bounds.push(coords);
    });
    detailMap.fitBounds(bounds)

}
