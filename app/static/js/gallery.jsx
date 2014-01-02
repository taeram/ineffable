/** @jsx React.DOM */

define('gallery',
[
    "jquery",
    "react",
    "linear-partition"
], function(
    $,
    React,
    linear_partition
) {

    var ContentBox = React.createClass({
        render: function() {
            return (
                <div className="content">
                    Hello, world! I am some content. One day I&rsquo;ll show you some photos.
                </div>
            );
        }
    });

    React.renderComponent(
        <ContentBox />,
        document.getElementById('app')
    );
});
