/** @jsx React.DOM */

define('gallery-list',
[
    "jquery",
    "react",
    "photo-row",
    "photo-partition"
], function(
    $,
    React,
    PhotoRow,
    photoPartition
) {

    var GalleryList = React.createClass({
        getInitialState: function() {
            return {data: []};
        },

        componentWillMount: function() {
            $.ajax({
                url: this.props.url,
                success: function(data) {
                    this.setState({data: data});
                }.bind(this)
            });
        },

        render: function() {
            var viewportWidth = this.props.viewportWidth;
            var windowHeight = this.props.windowHeight;
            var photoPaddingX = this.props.photoPaddingX;
            var photoPaddingY = this.props.photoPaddingY;
            var galleryNodes = this.state.data.map(function (gallery) {

                var showGallery = function () {
                    History.pushState({gallery: gallery.id}, gallery.name, getSlug(gallery.id, gallery.name));
                }

                return <Gallery
                            folder={gallery.folder}
                            name={gallery.name}
                            id={gallery.id}
                            photos={gallery.photos}
                            photoPaddingX={photoPaddingX}
                            photoPaddingY={photoPaddingY}
                            photoType='thumb'
                            onClick={showGallery}
                            viewportWidth={viewportWidth}
                            windowHeight={windowHeight} />;
            });

            return (
                <div className="gallery-list">
                    {galleryNodes}
                </div>
            );
        }
    });

    var Gallery = React.createClass({
        render: function() {
            var partitionedPhotos = photoPartition(
                this.props.photos,
                this.props.photoPaddingX,
                this.props.photoPaddingY,
                this.props.photoType,
                this.props.viewportWidth,
                this.props.windowHeight
            );

            // Only show the first row
            if (_.isArray(partitionedPhotos[0])) {
                partitionedPhotos = partitionedPhotos[0];
            }

            return (
                <div id={getSlug(this.props.id, this.props.name)} className="gallery" onClick={this.props.onClick}>
                    <h2 className="gallery-heading">{this.props.name}</h2>
                    <PhotoRow onClickEnabled={false} folder={this.props.folder} photos={partitionedPhotos} type={this.props.photoType} />
                </div>
            );
        }
    });

    /**
     * Get a slug
     *
     * @param integer id The id
     * @param string name The name
     *
     * @return string
     */
    var getSlug = function (id, name) {
        name = name.toLowerCase();
        name = name.replace(/[^a-z0-9]/g, '-').replace(/--/, '-');
        return id + '-' + name;
    }

    return GalleryList;
});
