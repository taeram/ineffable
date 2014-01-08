/** @jsx React.DOM */

define('routes', ['router'], function() {
    var router = new Router();

    // Gallery List
    router.route('/', function() {
        require(['react', 'gallery-list'], function (React, GalleryList) {
            var render = function () {
                React.renderComponent(
                    <GalleryList url="/rest/gallery/" container={Config.App.elementId} />,
                    document.getElementById(Config.App.elementId)
                );
            };
            render();

            // Re-render on window resize
            $(window).resize(_.debounce(render, 200));
        });
    });

    // Single Gallery
    router.route('/:id-*slug', function(gallery_id, slug) {
        // Sanitize the id
        gallery_id = gallery_id.replace(/-.*$/, '')
    });

    // Photo Uploader
    router.route('/upload/:id', function(id) {
        require(['uploader'], function () {
            // Resume bootstrapping
            // http://code.angularjs.org/1.2.1/docs/guide/bootstrap#overview_deferred-bootstrap
            angular.resumeBootstrap();
        })
    });

    return router;
});
