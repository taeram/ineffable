/** @jsx React.DOM */

require.config({
    baseUrl: '/static/components/',
    paths: {
        "bootstrap": "bootstrap/dist/js/bootstrap.min",
        "jquery": "jquery/jquery",
        "react": "react/react.min",

        // Angular deps for uploader. To be refactored to React
        "angular": "angular/angular.min",
        "jquery-serialize-object": "jquery-serialize-object/jquery.serialize-object.compiled",
        "dirname": "phpjs/functions/filesystem/dirname",
        "number_format": "phpjs/functions/strings/number_format",
        "underscore": "underscore/underscore",

        // App
        "uploader": "/static/js/uploader"
    },
    shim: {
        'angular': {
            exports: 'angular'
        },
        'bootstrap': {
            deps: ['jquery']
        },
        'dirname': {
            exports: 'dirname'
        },
        'jquery-serialize-object': {
            deps: ['jquery']
        },
        'number_format': {
            exports: 'number_format'
        },
        'underscore': {
            exports: '_'
        },
    }
});

// Defer loading angular
// http://code.angularjs.org/1.2.1/docs/guide/bootstrap#overview_deferred-bootstrap
window.name = "NG_DEFER_BOOTSTRAP!";

if (window.location.pathname.match('/upload/')) {
    require(['uploader'], function (uploader) {
        // Resume bootstrapping
        // http://code.angularjs.org/1.2.1/docs/guide/bootstrap#overview_deferred-bootstrap
        angular.resumeBootstrap();
    })
}

require(["jquery", "react", "bootstrap"], function($, React) {
    /*
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
    */
});
