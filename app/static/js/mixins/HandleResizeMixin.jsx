/** @jsx React.DOM */

define('handle-resize-mixin', ['react', 'underscore'], function(React, _) {

    /**
     * Triggered by window resize events
     */
    var HandleResizeMixin = {
        handleResize: _.debounce(function(e) {
            console.log('resize', this)
                this.setState({windowWidth: window.innerWidth});
            },
            200
        ),

        componentDidMount: function() {
            window.addEventListener('resize', this.handleResize);
        },

        componentWillUnmount: function() {
            window.removeEventListener('resize', this.handleResize);
        }
    };

    return HandleResizeMixin;
});
