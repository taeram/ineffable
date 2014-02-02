/** @jsx React.DOM */

define('gallery', ['react', 'photo-partition', 'photo', 'lightbox'], function(React, photoPartition, Photo, Lightbox) {

    var Gallery = React.createClass({

        /**
         * The ideal row height
         *
         * @var integer
         */
        idealRowHeight: 100,

        /**
         * A list of all photo elements
         *
         * @var DOM
         */
        photos: null,

        /**
         * Show the Lightbox
         *
         * @param DOM photo The photo to display
         */
        onClick: function (photo) {
            React.renderComponent(
                <Lightbox photo={photo} photos={this.photos} />,
                document.getElementById(Config.App.lightboxElementId)
            );
        },

        render: function() {
            var viewportWidth = parseInt(Config.App.viewportWidth, 10),
                photoPaddingX = parseInt(Config.Photo.paddingX, 10),
                photoPaddingY = parseInt(Config.Photo.paddingY, 10);

            this.photos = [];
            var photoRows = photoPartition(this.props.photos, this.idealRowHeight, viewportWidth, photoPaddingX, photoPaddingY);
            var photoRowNodes = _.map(photoRows, function (photoRow) {
                var photoNodes = _.map(photoRow, function (photo) {
                    var photo = <Photo folder={this.props.folder}
                                       height={photo.height}
                                       name={photo.name}
                                       width={photo.width}
                                       type="thumb"
                                       onClick={this.onClick} />;

                    // Store a list of all photos
                    this.photos.push(photo);

                    return photo;
                }, this);

                return (
                    <div>
                        {photoNodes}
                    </div>
                );
            }, this);

            var galleryDate = moment(this.props.created).format('MMMM Do, YYYY');

            return (
                <div className="gallery">
                    <h2 className="gallery-heading">
                        {this.props.name}
                        <span class="gallery-heading-date">
                            {galleryDate}
                        </span>
                    </h2>
                    {photoRowNodes}
                </div>
            );
        }
    });

    return Gallery;
});
