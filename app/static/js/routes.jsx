/** @jsx React.DOM */

define('routes', ['router'], function() {
    var router = new Router();

    // Gallery List
    router.route('/', function() {
        require(['react', 'gallery-list'], function (React, GalleryList) {
            React.render(
                <GalleryList url="/rest/gallery" galleries={galleries_json} hasMorePages={has_more_pages} pageNum={page_num}/>,
                document.getElementById(Config.App.elementId)
            );
        });
    });

    // Photo Uploader
    router.route('/gallery/upload/:id', function(id) {
        require(['react', 'uploader'], function (React, Uploader) {
            React.render(
                <Uploader />,
                document.getElementById(Config.App.uploaderId)
            )
        });
    });

    // Shared Gallery
    router.route('/s/:code', function(code) {
        require(['react', 'gallery'], function (React, Gallery) {
            // Uses gallery_json from the page
            React.render(
                <Gallery folder={gallery_json.folder} name={gallery_json.name} photos={gallery_json.photos} created={gallery_json.created} modified={gallery_json.modified} isShared={true} />,
                document.getElementById(Config.App.elementId)
            );
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
