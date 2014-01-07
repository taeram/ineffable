/** @jsx React.DOM */

require.config({
    baseUrl: '/static/components/',
    urlArgs: "d=" + parseInt(Config.cache_buster, 10),
    paths: {
        "bootstrap": "bootstrap/dist/js/bootstrap.min",
        "history": "history.js/scripts/bundled/html4%2Bhtml5/native.history",
        "jquery": "jquery/jquery.min",
        "linear-partition": "linear-partition/linear_partition.min",
        "react": "react/react-with-addons.min",
        "router": "routerjs/Router.min",

        // Angular deps for uploader. To be refactored to React
        "angular": "angular/angular.min",
        "jquery-serialize-object": "jquery-serialize-object/jquery.serialize-object.compiled",
        "dirname": "phpjs/functions/filesystem/dirname",
        "number_format": "phpjs/functions/strings/number_format",
        "underscore": "underscore/underscore-min",

        // App
        "gallery-list": "/static/js/gallery-list",
        "gallery-item": "/static/js/gallery-item",
        "photo-partition": "/static/js/photo-partition",
        "photo-row": "/static/js/photo-row",
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
        }
    }
});

// Defer loading angular
// http://code.angularjs.org/1.2.1/docs/guide/bootstrap#overview_deferred-bootstrap
window.name = "NG_DEFER_BOOTSTRAP!";

require(['jquery', 'router', 'history'], function ($,  Router) {
    var router = new Router();

    var getViewportWidth = function () {
        return $('#app').width() - 15;
    }

    var getWindowHeight = function () {
        return $(window).height();
    }

    var getPhotoPaddingX = function () {
        return 1;
    }

    var getPhotoPaddingY = function () {
        return 1;
    }

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
        require(["react", "gallery-list", "underscore"], function(React, GalleryList, _) {

            // Enable touch events
            React.initializeTouchEvents(true);

            var renderGalleryList = function () {
                React.renderComponent(
                    <GalleryList
                        url="/rest/gallery/"
                        photoPaddingX={getPhotoPaddingX()}
                        photoPaddingY={getPhotoPaddingY()}
                        viewportWidth={getViewportWidth()}
                        windowHeight={getWindowHeight()} />,
                    document.getElementById('app')
                );
            }
            setTimeout(renderGalleryList, 500);

            var resizeGalleryList = _.debounce(renderGalleryList, 200);
            $(window).resize(resizeGalleryList);
        });
    });

    // Index
    router.route('/:id-*slug', function(gallery_id, slug) {
        // Sanitize the id
        gallery_id = gallery_id.replace(/-.*$/, '')

        require(["react", "gallery-item", "underscore"], function(React, GalleryItem, _) {
            // Enable touch events
            React.initializeTouchEvents(true);

            var renderGalleryItem = function () {
                React.renderComponent(
                    <GalleryItem
                        url={"/rest/gallery/" + gallery_id}
                        photoPaddingX={getPhotoPaddingX()}
                        photoPaddingY={getPhotoPaddingY()}
                        viewportWidth={getViewportWidth()}
                        windowHeight={getWindowHeight()} />,
                    document.getElementById('app')
                );
            }
            setTimeout(renderGalleryItem, 500);

            var resizeGalleryItem = _.debounce(renderGalleryItem, 200);
            $(window).resize(resizeGalleryItem);
        });
    });

    // Start the router
    router.start(window.location.pathname);
})
