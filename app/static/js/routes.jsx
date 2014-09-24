/** @jsx React.DOM */

define('routes', ['router'], function() {
    var router = new Router();

    // Gallery List
    router.route('/', function() {
        require(['react', 'gallery-list'], function (React, GalleryList) {
            React.renderComponent(
                <GalleryList url="/rest/gallery" />,
                document.getElementById(Config.App.elementId)
            );
        });
    });

    // Verify a Gallery
    router.route('/verify/:id', function(gallery_id) {
        require(['react', 'gallery-verify'], function (React, GalleryVerify) {
            React.renderComponent(
                <GalleryVerify url="/rest/gallery" id={gallery_id} />,
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
        });
    });

    // Users list
    router.route('/users/', function () {
        $('.btn-delete').on('click', function (e) {
            return confirm("Are you sure you want to delete this user?");
        });
    });

    return router;
});
