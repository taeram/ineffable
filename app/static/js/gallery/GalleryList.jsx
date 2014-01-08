/** @jsx React.DOM */

define('gallery-list', ['react', 'jquery', 'gallery'], function(React, $, Gallery) {

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
            var galleryNodes = this.state.data.map(function (gallery, i) {
                return <Gallery
                            folder={gallery.folder}
                            id={gallery.id}
                            name={gallery.name}
                            photos={gallery.photos} />;
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
