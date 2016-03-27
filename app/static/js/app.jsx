/** @jsx React.DOM */

require.config({
    baseUrl: '/static/',
    urlArgs: "d=" + parseInt(Config.cache_buster, 10),
    paths: {
        // Dependencies
        "basename": "components/phpjs/functions/filesystem/basename",
        "bootstrap": "components/bootstrap/dist/js/bootstrap.min",
        "classnames": "components/classnames/dedupe",
        "dirname": "components/phpjs/functions/filesystem/dirname",
        "history": "components/history.js/scripts/bundled/html4%2Bhtml5/native.history",
        "in_array": "components/phpjs/functions/array/in_array",
        "jpegmeta": "components/jsjpegmeta/jpegmeta",
        "jquery-serialize-object": "components/jquery-serialize-object/dist/jquery.serialize-object.min",
        "jquery": "components/jquery/dist/jquery.min",
        "linear-partition": "components/linear-partition/linear_partition.min",
        "moment": "components/momentjs/moment",
        "mousetrap": "components/mousetrap/mousetrap.min",
        "number_format": "components/phpjs/functions/strings/number_format",
        "react": "components/react/react-with-addons",
        "router": "components/routerjs/Router",
        "underscore": "components/underscore/underscore-min",
        "unveil": "components/unveil/jquery.unveil",
        "urldecode": "components/phpjs/functions/url/urldecode",

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
        "s3-uploader": "js/helpers/s3-uploader",

        // Mixins
        "handle-resize-mixin": "js/mixins/HandleResizeMixin",
        "photo-mixin": "js/mixins/PhotoMixin"
    },
    shim: {
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
        'in_array': {
            exports: 'in_array'
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
        },
        'unveil': {
            deps: ['jquery']
        },
        'urldecode': {
            exports: 'urldecode'
        }
    }
});

// Configure the application
Config.App = {
    // The DOM id of the app container
    elementId: 'app',

    // The DOM id of the lightbox container
    lightboxElementId: 'app-lightbox',

    // The DOM id of the Modal container
    modalElementId: 'app-modal',

    // The DOM id of the Uploader container
    uploaderId: 'uploader',

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
