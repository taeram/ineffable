/** @jsx React.DOM */

define('routes', ['router'], function() {
    var router = new Router();

    // Gallery List
    router.route('/', function() {
        require(['react', 'gallery-list'], function (React, GalleryList) {
            React.renderComponent(
                <GalleryList url="/rest/gallery/" container={Config.App.elementId} />,
                document.getElementById(Config.App.elementId)
            );
        });
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
