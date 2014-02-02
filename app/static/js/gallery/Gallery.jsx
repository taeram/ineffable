/** @jsx React.DOM */

define('gallery', ['react', 'photo-partition', 'photo', 'history'], function(React, photoPartition, Photo, History) {

    var Gallery = React.createClass({

        /**
         * The ideal row height
         *
         * @var integer
         */
        idealRowHeight: 100,

        render: function() {
            var viewportWidth = parseInt(Config.App.viewportWidth, 10),
                photoPaddingX = parseInt(Config.Photo.paddingX, 10),
                photoPaddingY = parseInt(Config.Photo.paddingY, 10);

            var photoRows = photoPartition(this.props.photos, this.idealRowHeight, viewportWidth, photoPaddingX, photoPaddingY);
            var photoRowNodes = _.map(photoRows, function (photoRow) {
                var photoNodes = _.map(photoRow, function (photo) {
                    return <Photo folder={this.props.folder}
                                  height={photo.height}
                                  name={photo.name}
                                  width={photo.width}
                                  type="thumb" />;
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
