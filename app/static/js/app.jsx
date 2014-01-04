/** @jsx React.DOM */

require.config({
    baseUrl: '/static/components/',
    urlArgs: "d=" + parseInt(Config.cache_buster, 10),
    paths: {
        "bootstrap": "bootstrap/dist/js/bootstrap.min",
        "history": "history.js/scripts/bundled/html4%2Bhtml5/native.history",
        "jquery": "jquery/jquery.min",
        "react": "react/react.min",
        "router": "routerjs/Router.min",
        "linear-partition": "linear-partition/linear_partition.min",

        // Angular deps for uploader. To be refactored to React
        "angular": "angular/angular.min",
        "jquery-serialize-object": "jquery-serialize-object/jquery.serialize-object.compiled",
        "dirname": "phpjs/functions/filesystem/dirname",
        "number_format": "phpjs/functions/strings/number_format",
        "underscore": "underscore/underscore-min",

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
        'router': {
            exports: 'window.Router'
        },
        'underscore': {
            exports: '_'
        },
    }
});

// Defer loading angular
// http://code.angularjs.org/1.2.1/docs/guide/bootstrap#overview_deferred-bootstrap
window.name = "NG_DEFER_BOOTSTRAP!";

require(['jquery', 'router', 'history'], function ($,  Router) {
    var router = new Router();

    // Uploader
    router.route('/upload/:id', function(id) {
        require(['uploader'], function () {
            // Resume bootstrapping
            // http://code.angularjs.org/1.2.1/docs/guide/bootstrap#overview_deferred-bootstrap
            angular.resumeBootstrap();
        })
    });

    // Index
    router.route('/', function() {
        require(["react", "gallery", "underscore"], function(React, GalleryList, _) {

            var renderGallery = function () {
                var viewportWidth = $('#app').width() - 15;
                var windowHeight = $(window).height();
                React.renderComponent(
                    <GalleryList
                        url="/rest/gallery/"
                        photoPaddingX={1}
                        photoPaddingY={1}
                        viewportWidth={viewportWidth}
                        windowHeight={windowHeight} />,
                    document.getElementById('app')
                );
            }
            setTimeout(renderGallery, 500);

            var resizeGallery = _.debounce(renderGallery, 200);
            $(window).resize(resizeGallery);
        });
    });

    // Start the router
    router.start(window.location.pathname);
})
