/** @jsx React.DOM */

define('gallery-list', ['react', 'jquery', 'moment', 'gallery'], function(React, $, moment, Gallery) {

    var GalleryList = React.createClass({
        getInitialState: function() {
            return {data: []};
        },

        componentWillMount: function() {
            $.ajax({
                url: this.props.url,
                success: function(data) {
                    if (!Array.isArray(data)) {
                        data = [data];
                    }

                    this.setState({data: data});
                }.bind(this)
            });
        },

        render: function() {
            var prevGalleryDate = null;
            var galleryNodes = this.state.data.map(function (gallery, i) {
                var galleryDateline = null;
                var galleryDate = moment(gallery.created).format('MMMM YYYY');
                if (galleryDate != prevGalleryDate) {
                    prevGalleryDate = galleryDate;
                    galleryDateline = (
                        <div className="gallery-date">
                            <hr className="gallery-date-line" />
                            <span className="gallery-date-text">
                                <span className="gallery-date-text-bg">
                                    {galleryDate}
                                </span>
                            </span>
                        </div>
                    )
                }

                return (
                    <div>
                        {galleryDateline}
                        <Gallery folder={gallery.folder}
                                id={gallery.id}
                                name={gallery.name}
                                photos={gallery.photos} />
                    </div>
                )
            }, this);

            return (
                <div>
                    {galleryNodes}
                </div>
            );
        }
    });

    return GalleryList;
});
