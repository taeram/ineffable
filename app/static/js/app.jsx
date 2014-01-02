/** @jsx React.DOM */

require.config({
    baseUrl: '/static/components/',
    urlArgs: "d=" + parseInt(Config.cache_buster, 10),
    paths: {
        "bootstrap": "bootstrap/dist/js/bootstrap.min",
        "jquery": "jquery/jquery",
        "react": "react/react.min",
        "linear-partition": "linear-partition/linear_partition",

        // Angular deps for uploader. To be refactored to React
        "angular": "angular/angular.min",
        "jquery-serialize-object": "jquery-serialize-object/jquery.serialize-object.compiled",
        "dirname": "phpjs/functions/filesystem/dirname",
        "number_format": "phpjs/functions/strings/number_format",
        "underscore": "underscore/underscore",

        // App
        "gallery": "/static/js/gallery",
        "uploader": "/static/js/uploader"
    },
    shim: {
        'angular': {
            exports: 'angular'
        },
        'bootstrap': {
            deps: ['jquery']
        },
        'dirname': {
            exports: 'dirname'
        },
        'jquery-serialize-object': {
            deps: ['jquery']
        },
        'linear-partition': {
            exports: 'linear_partition'
        },
        'number_format': {
            exports: 'number_format'
        },
        'underscore': {
            exports: '_'
        },
    }
});

// Defer loading angular
// http://code.angularjs.org/1.2.1/docs/guide/bootstrap#overview_deferred-bootstrap
window.name = "NG_DEFER_BOOTSTRAP!";

if (window.location.pathname.match('/upload/')) {
    require(['uploader'], function (uploader) {
        // Resume bootstrapping
        // http://code.angularjs.org/1.2.1/docs/guide/bootstrap#overview_deferred-bootstrap
        angular.resumeBootstrap();
    })
}

if (window.location.pathname.match('^/$')) {
    require(["gallery"], function(gallery) {
        // Init the gallery
    });
}
