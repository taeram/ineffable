/** @jsx React.DOM */

define('gallery-verify', ['react', 'jquery', 'underscore', 'gallery-mixin', 'photo-mixin', 'basename'], function(React, $, _, GalleryMixin, PhotoMixin, basename) {

    var GalleryVerify = React.createClass({

        mixins: [GalleryMixin, PhotoMixin],

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
        },

        retrieve: function () {
            // Get the gallery
            $.ajax({
                url: this.props.url,
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

                    this.retrieveGallery(response.folder, response.modified, success, error);
                }.bind(this)
            });
        },

        parsePhotos: function (photos) {
            // Iterate through all photos and find which ones are missing
            for (var i=0; i < this.state.photos.length; i++) {
                var photo = this.state.photos[i];
                var thumbUrl = this.photoUrl('thumb', photo.ext, this.state.gallery.folder, photo.name);
                this.testPhotoExists(thumbUrl);

                var displayUrl = this.photoUrl('display', photo.ext, this.state.gallery.folder, photo.name);
                this.testPhotoExists(displayUrl);
            }
        },

        testPhotoExists: function (photoUrl, photo) {
            $.ajax({
                url: photoUrl,
                type: 'HEAD',
                success: function () {
                    this.state.messages.push({
                        name: basename(photoUrl),
                        exists: true
                    });
                    this.setState({
                        messages: this.state.messages
                    })
                }.bind(this),
                error: function() {
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
            console.log("Rendering photo", photo);
        },

        render: function() {
            var messageNodes;
            if (this.state.messages.length > 0) {
                messageNodes = this.state.messages.map(function(photo, i) {
                    var liClassName = React.addons.classSet({
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
                <div>
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
