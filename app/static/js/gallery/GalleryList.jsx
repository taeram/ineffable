/** @jsx React.DOM */

define('gallery-list', ['react', 'jquery', 'moment', 'underscore', 'gallery'], function(React, $, moment, _, Gallery) {

    var GalleryList = React.createClass({

        getInitialState: function() {
            return {
                galleries: this.props.galleries
            };
        },

        removeGallery: function (galleryId) {
            galleries = _.filter(this.state.galleries, function (gallery) {
                return gallery.id != galleryId;
            });

            this.setState({
                galleries: galleries
            })
        },

        render: function() {
            var galleryNodes;
            var prevGalleryDate = null;
            if (this.state.galleries.length > 0) {
                galleryNodes = this.state.galleries.map(function (gallery, i) {
                    var galleryDateline = null;
                    var galleryDate = moment(gallery.created).format('MMMM YYYY');
                    if (galleryDate != prevGalleryDate) {
                        prevGalleryDate = galleryDate;
                        galleryDateline = (
                            <div key={"gallery-date-line-" + gallery.id} className="gallery-date">
                                <hr className="gallery-date-line" />
                                <span className="gallery-date-text">
                                    <span className="gallery-date-text-bg">
                                        {galleryDate}
                                    </span>
                                </span>
                            </div>
                        );
                    }

                    return (
                        <div key={"gallery-" + gallery.id}>
                            {galleryDateline}
                            <Gallery folder={gallery.folder}
                                    id={gallery.id}
                                    name={gallery.name}
                                    modified={gallery.modified}
                                    share_code={gallery.share_code}
                                    created={gallery.created}
                                    photos={gallery.photos}
                                    removeGallery={this.removeGallery} />
                        </div>
                    );
                }, this);
            } else {
                galleryNodes = (
                    <h2>No albums found</h2>
                );
            }

            var newerPageNode;
            if (this.props.pageNum > 1) {
                newerPageNode = (
                    <li>
                        <a href={"/?page=" + (this.props.pageNum - 1) }>&laquo; Newer</a>
                    </li>
                )
            }

            var olderPageNode;
            if (this.props.hasMorePages) {
                olderPageNode = (
                    <li>
                        <a href={"/?page=" + (this.props.pageNum + 1) }>Older &raquo;</a>
                    </li>
                )
            }

            return (
                <div>
                    {galleryNodes}
                    <nav className="gallery-navigation center">
                        <ul className="pagination">
                            {newerPageNode}
                            {olderPageNode}
                        </ul>
                    </nav>
                </div>
            );
        }
    });

    return GalleryList;
});
