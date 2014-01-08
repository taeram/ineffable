/** @jsx React.DOM */

require.config({
    baseUrl: '/static/',
    urlArgs: "d=" + parseInt(Config.cache_buster, 10),
    paths: {
        // Dependencies
        "bootstrap": "components/bootstrap/dist/js/bootstrap.min",
        "history": "components/history.js/scripts/bundled/html4%2Bhtml5/native.history",
        "jquery": "components/jquery/jquery.min",
        "linear-partition": "components/linear-partition/linear_partition.min",
        "react": "components/react/react-with-addons.min",
        "router": "components/routerjs/Router.min",
        "underscore": "components/underscore/underscore-min",

        // Angular deps for uploader. To be refactored to use React instead
        "angular": "components/angular/angular.min",
        "jquery-serialize-object": "components/jquery-serialize-object/jquery.serialize-object.compiled",
        "dirname": "components/phpjs/functions/filesystem/dirname",
        "number_format": "components/phpjs/functions/strings/number_format",

        // App
        "gallery": "js/gallery/Gallery",
        "gallery-list": "js/gallery/GalleryList",
        "photo": "js/gallery/Photo",
        "photo-list": "js/gallery/PhotoList",
        "routes": "js/routes",
        "uploader": "js/uploader/Uploader",

        // Helpers
        "photo-partition": "js/helpers/photo-partition"
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
        'history': {
            exports: 'window.History'
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
        'router': {
            exports: 'window.Router',
            deps: ['history']
        },
        'underscore': {
            exports: '_'
        }
    }
});

// Defer loading angular
// http://code.angularjs.org/1.2.1/docs/guide/bootstrap#overview_deferred-bootstrap
window.name = "NG_DEFER_BOOTSTRAP!";

// Configure the application
Config.App = {
    // The DOM id of the app container
    elementId: 'app',

    // Horizontal padding of the app container. Required for partitioning.
    paddingX: 15,

    // Calculated value
    viewportWidth: 0
};

// Configure the photos
Config.Photo = {
    // Horizontal padding of the photo element. Required for partitioning.
    paddingX: 1,

    // Vertical padding of the photo element. Required for partitioning.
    paddingY: 1
};

require(['react', 'routes', 'jquery', 'underscore'], function (React,  router, $, _) {
    // Setup React
    React.initializeTouchEvents(true);

    // Initialize the Config
    var initializeConfig = function () {
        Config.App.viewportWidth = $('#' + Config.App.elementId).width() - Config.App.paddingX;
    };
    $(window).resize(_.debounce(initializeConfig, 100));
    initializeConfig();

    // Start the router
    router.start(window.location.pathname);
})
