/** @jsx React.DOM */

define('gallery-verify', ['react', 'jquery', 'underscore', 'gallery-mixin', 'photo-mixin', 'basename', 'in_array', 'classnames'], function(React, $, _, GalleryMixin, PhotoMixin, basename, in_array, classnames) {

    var GalleryVerify = React.createClass({

        mixins: [GalleryMixin, PhotoMixin],

        /**
         * Does this gallery have any missing photos?
         */
        hasMissingPhotos: false,

        /**
         * The list of photos we've sent to be re-rendered
         */
        renderedPhotos: [],

        /**
         * The number of photos we've parsed through
         */
        parsedPhotos: 0,

        /**
         * The interval for inspectNextAlbum
         */
        inspectInterval: null,

        getInitialState: function() {
            return {
                isLoading: true,
                gallery: {
                    name: ""
                },
                photos: [],
                messages: []
            };
        },

        componentWillMount: function() {
            this.retrieve();

            // If "?all" is appended to the query string, iterate through all albums
            if (window.location.search.match(/all/)) {
                this.inspectInterval = setInterval(this.inspectNextAlbum.bind(this), 1000);
            }
        },

        inspectNextAlbum: function() {
            if (this.state.isLoading === false && this.parsedPhotos == (this.state.photos.length * 2)) {
                var nextAlbumId = parseInt(this.props.id, 10) + 1;
                if (window.location.hash.length > 0) {
                    var maxAlbumId = window.location.hash.match(/=(\d+)/)[1];
                    maxAlbumId = parseInt(maxAlbumId, 10);
                    if (nextAlbumId > maxAlbumId) {
                        clearInterval(this.inspectInterval);
                        this.state.messages.push({
                            name: "Max album id reached, stopping...",
                            exists: true
                        });
                        this.setState({
                            message: this.state.messages
                        })
                        return;
                    }
                }

                window.location.href = "/verify/" + nextAlbumId + "?all" + window.location.hash;
            }
        },

        retrieve: function () {
            // Get the gallery
            $.ajax({
                url: this.props.url + '/' + this.props.id,
                success: function(response) {
                    this.state.gallery = response;
                    this.setState({
                        isLoading: true,
                        gallery: this.state.gallery
                    });

                    // Get the photos for this gallery
                    var success = function(response) {
                        this.state.photos = JSON.parse(response);
                        this.setState({
                            photos: this.state.photos,
                            isLoading: false
                        });

                        this.parsePhotos();
                    }.bind(this);

                    var error = function () {
                        this.setState({
                            isLoading: false
                        });
                    }.bind(this);

                    this.retrievePhotos(response.folder, response.modified, success, error);
                }.bind(this),
                error: function () {
                    this.setState({
                        isLoading: false
                    });
                }.bind(this)
            });
        },

        parsePhotos: function (photos) {
            // Iterate through all photos and find which ones are missing
            for (var i=0; i < this.state.photos.length; i++) {
                var photo = this.state.photos[i];
                var thumbUrl = this.photoUrl('thumb', photo.ext, this.state.gallery.folder, photo.name);
                this.testPhotoExists(thumbUrl, photo);

                var displayUrl = this.photoUrl('display', photo.ext, this.state.gallery.folder, photo.name);
                this.testPhotoExists(displayUrl, photo);
            }
        },

        testPhotoExists: function (photoUrl, photo) {
            $.ajax({
                url: photoUrl,
                type: 'HEAD',
                success: function () {
                    this.parsedPhotos++;

                    this.state.messages.push({
                        name: basename(photoUrl),
                        exists: true
                    });
                    this.setState({
                        messages: this.state.messages
                    })
                }.bind(this),
                error: function() {
                    this.hasMissingPhotos = true;
                    this.triggerPhotoRender(photo);

                    this.state.messages.push({
                        name: basename(photoUrl),
                        exists: false
                    });
                    this.setState({
                        messages: this.state.messages
                    })
                }.bind(this)
            });
        },

        triggerPhotoRender: function(photo) {
            var data = {
                name: photo.name,
                ext: photo.ext,
                gallery_id: this.props.id
            };

            // Don't process the same photo twice
            if (in_array(data.name, this.renderedPhotos)) {
                return;
            }
            this.renderedPhotos.push(data.name);

            $.post('/verify/thumbnail/', data, function () {
                this.parsedPhotos += 2;
            }.bind(this));
        },

        render: function() {
            var messageNodes;
            if (this.state.messages.length > 0) {
                messageNodes = this.state.messages.map(function(photo, i) {
                    var liClassName = classnames({
                        'text-success': photo.exists,
                        'text-danger': !photo.exists
                    })
                    var message = photo.name + (photo.exists ? " found" : " not found, rendering...");

                    return (
                        <li className={liClassName}>{message}</li>
                    );
                });
            }

            return (
                <div key={this.state.gallery.name}>
                    <h2>{this.state.gallery.name}</h2>
                    <ul className="list-unstyled">
                        {messageNodes}
                    </ul>
                </div>
            );
        }
    });

    return GalleryVerify;
});
