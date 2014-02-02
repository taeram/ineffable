/** @jsx React.DOM */

define('gallery-list', ['react', 'jquery', 'moment', 'underscore', 'gallery'], function(React, $, moment, _, Gallery) {

    var GalleryList = React.createClass({
        getInitialState: function() {
            return {data: []};
        },

        /**
         * Triggered by window resize events
         */
        handleResize: _.debounce(
            function(e) {
                this.state.windowWidth = window.innerWidth;
                this.setState(this.state);
            },
            200
        ),

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

        componentDidMount: function() {
            window.addEventListener('resize', this.handleResize);
        },

        componentWillUnmount: function() {
            window.removeEventListener('resize', this.handleResize);
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
                                created={gallery.created}
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
