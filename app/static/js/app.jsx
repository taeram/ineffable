/** @jsx React.DOM */

require.config({
    baseUrl: '/static/',
    urlArgs: "d=" + parseInt(Config.cache_buster, 10),
    paths: {
        // Dependencies
        "bootstrap": "components/bootstrap/dist/js/bootstrap.min",
        "history": "components/history.js/scripts/bundled/html4%2Bhtml5/native.history",
        "jquery": "components/jquery/dist/jquery.min",
        "jpegmeta": "components/jsjpegmeta/jpegmeta",
        "linear-partition": "components/linear-partition/linear_partition.min",
        "moment": "components/momentjs/moment",
        "react": "components/react/react-with-addons.min",
        "router": "components/routerjs/Router",
        "underscore": "components/underscore/underscore-min",

        // Angular deps for uploader. To be refactored to use React instead
        "angular": "components/angular/angular.min",
        "jquery-serialize-object": "components/jquery-serialize-object/jquery.serialize-object.compiled",
        "dirname": "components/phpjs/functions/filesystem/dirname",
        "number_format": "components/phpjs/functions/strings/number_format",
        "basename": "components/phpjs/functions/filesystem/basename",

        // App
        "gallery": "js/gallery/Gallery",
        "gallery-list": "js/gallery/GalleryList",
        "gallery-verify": "js/gallery/GalleryVerify",
        "lightbox": "js/gallery/Lightbox",
        "modal": "js/helpers/Modal",
        "photo": "js/gallery/Photo",
        "photo-list": "js/gallery/PhotoList",
        "routes": "js/routes",
        "uploader": "js/uploader/Uploader",

        // Helpers
        "photo-partition": "js/helpers/photo-partition",

        // Mixins
        "handle-resize-mixin": "js/mixins/HandleResizeMixin",
        "gallery-mixin": "js/mixins/GalleryMixin",
        "photo-mixin": "js/mixins/PhotoMixin"
    },
    shim: {
        'angular': {
            exports: 'angular'
        },
        'basename': {
            exports: 'basename'
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

    // The DOM id of the lightbox container
    lightboxElementId: 'app-lightbox',

    // The DOM id of the Modal container
    modalElementId: 'app-modal',

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

require(['react', 'routes', 'jquery', 'underscore', 'bootstrap'], function (React,  router, $, _, bs) {
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
});
