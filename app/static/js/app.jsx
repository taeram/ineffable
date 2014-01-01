/** @jsx React.DOM */

require.config({
    baseUrl: '/static/components/',
    paths: {
        "bootstrap": "bootstrap/dist/js/bootstrap.min",
        "jquery": "jquery/jquery",
        "react": "react/react.min"
    }
});

require(["jquery", "react", "bootstrap"], function($, React) {
    var ContentBox = React.createClass({
      render: function() {
        return (
          <div className="content">
            Hello, world! I am some content.
          </div>
        );
      }
    });
    React.renderComponent(
      <ContentBox />,
      document.getElementById('app')
    );
});
