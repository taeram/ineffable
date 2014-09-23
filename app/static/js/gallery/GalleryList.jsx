/** @jsx React.DOM */

define('gallery-list', ['react', 'jquery', 'moment', 'underscore', 'handle-resize-mixin', 'gallery'], function(React, $, moment, _, HandleResizeMixin, Gallery) {

    var GalleryList = React.createClass({
        mixins: [HandleResizeMixin],

        getInitialState: function() {
            return {
                isLoading: true,
                hasMorePages: true,
                pageNum: 1,
                data: []
            };
        },

        componentWillMount: function() {
            this.retrieve();

            $(window).unbind('resize.gallery-list').bind('resize.gallery-list', _.debounce(this.triggerNextPage, 1000));
            $(window).unbind('scroll.gallery-list').bind('scroll.gallery-list', _.debounce(this.triggerNextPage, 1000));
        },

        retrieve: function () {
            var searchQuery = "";
            if ($('#search').val()) {
                searchQuery = "&q=" + $('#search').val();
            }

            $.ajax({
                url: this.props.url + '/?page=' + this.state.pageNum + searchQuery,
                success: function(response) {
                    var data;
                    if (this.state.data.length > 0) {
                        data = this.state.data;
                        for (var i=0; i < response.length; i++) {
                            data.push(response[i]);
                        }
                    } else {
                        data = response;
                    }

                    this.setState({
                        isLoading: false,
                        hasMorePages: (response.length > 0),
                        data: data
                    });

                    // Just in case the current window displays *all* of the current galleries,
                    // manually trigger a next page
                    //this.triggerNextPage();
                }.bind(this)
            });
        },

        removeGallery: function (galleryId) {
            data = _.filter(this.state.data, function (gallery) {
                return gallery.id != galleryId;
            });

            this.setState({
                data: data
            })
        },

        triggerNextPage: function () {
            // Don't bother triggering if there are no more pages
            if (!this.state.hasMorePages) {
                $(window).unbind('resize.gallery-list');
                $(window).unbind('scroll.gallery-list');
                return;
            }

            var pageHeight = $(document).height();
            var scrollbarPosition = $(window).scrollTop() + $(window).height();
            var fudge = 250;

            if (pageHeight - fudge <= scrollbarPosition) {
                this.nextPage();
            }
        },

        nextPage: function () {
            this.state.pageNum++;
            this.setState({
                isLoading: true,
                pageNum: this.state.pageNum
            });

            this.retrieve();
        },

        render: function() {
            var loadingNode;
            if (this.state.isLoading) {
                loadingNode = (
                    <div className="text-center text-large" style={{fontSize: "24px", height: "60px"}}>
                        <i className="fa fa-spin fa-circle-o-notch"></i>
                    </div>
                );
            } else {
                loadingNode = (
                    <div style={{height: "60px"}}> </div>
                );
            }
            
            var galleryNodes;
            var prevGalleryDate = null;
            if (this.state.data.length > 0) {
                galleryNodes = this.state.data.map(function (gallery, i) {
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
                                    created={gallery.created}
                                    photos={gallery.photos} 
                                    removeGallery={this.removeGallery} />
                        </div>
                    );
                }, this);
            } else if (!this.state.isLoading) {
                galleryNodes = (
                    <h2>No albums found</h2>
                );
            }

            return (
                <div>
                    {galleryNodes}
                    {loadingNode}
                </div>
            );
        }
    });

    return GalleryList;
});
