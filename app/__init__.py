import os
from flask import Flask, \
                  send_from_directory
from flask.ext.compress import Compress
from flask.ext.login import current_user
import subprocess
import re
from react import jsx

app = Flask(__name__)
app.config.from_envvar('FLASKR_SETTINGS', silent=True)

# Plugins
Compress(app)

if os.getenv('FLASK_ENV') == 'production':
    app.config.from_object('config.ProductionConfig')
else:
    app.config.from_object('config.DevelopmentConfig')

import auth
import filters


@app.route('/favicon.ico')
def favicon():
    """ Return the favicon """
    return send_from_directory(os.path.join(app.root_path, 'static'), 'favicon.png', mimetype='image/png')


@app.route('/static/favicon-<int:cachebuster>.png', methods=['GET'])
def handle_cachebusted_favicon(cachebuster):
    """ Handle a cachebusted favicon request """
    return send_from_directory(os.path.join(app.root_path, 'static'), 'favicon.png', mimetype='image/png')


@app.route('/apple-touch-icon-precomposed.png')
def favicon_apple():
    """ Return the favicon """
    return send_from_directory(os.path.join(app.root_path, 'static'), 'favicon.png', mimetype='image/png')

if app.debug:
    @app.route('/static/js/<path:filename>', methods=['GET'])
    def compile_jsx(filename):
        """ Parse the JSX on the fly if we're in debug mode """
        filename = re.sub(r"\-[0-9]+", "", filename)
        jsx_path = os.path.join(app.root_path, 'static/js/%sx' % filename)
        print jsx_path
        try:
            js = jsx.transform(jsx_path)
            return app.response_class(response=js, mimetype='text/javascript')
        except jsx.TransformError as e:
            return app.response_class(response="%s" % e, status=500)

    @app.route('/static/css/<path:filename>', methods=['GET'])
    def compile_less(filename):
        """ Parse the LESS on the fly if we're in debug mode """
        filename = filename.replace('.css', '.less')
        filename = re.sub(r"\-[0-9]+", "", filename)
        less_path = os.path.join(app.root_path, 'static/css/%s' % filename)

        proc = subprocess.Popen('/usr/bin/lessc --no-color %s 1>&2' % less_path,
                                shell=True,
                                stdout=subprocess.PIPE,
                                stderr=subprocess.PIPE,
                                )
        stdout, stderr = proc.communicate()

        if proc.returncode != 0:
            return app.response_class(response=stderr, mimetype="text/plain", status=500)
        else:
            return app.response_class(response=stderr, mimetype='text/css')
else:
    @app.route('/static/js/<path:filename>', methods=['GET'])
    def handle_cachebusted_js(filename):
        """ Handle cachebusted JavaScript requests """
        filename = re.sub(r"\-[0-9]+", "", filename)
        js_path = os.path.join(app.root_path, 'static/js/%s' % filename)
        js = open(js_path, 'r').read()
        return app.response_class(response=js, mimetype='text/javascript')

    @app.route('/static/css/<path:filename>', methods=['GET'])
    def handle_cachebusted_css(filename):
        """ Handle cachebusted CSS requests """
        filename = re.sub(r"\-[0-9]+", "", filename)
        css_path = os.path.join(app.root_path, 'static/css/%s' % filename)
        css = open(css_path, 'r').read()
        return app.response_class(response=css, mimetype='text/css')

@app.context_processor
def inject_globals():
    return dict(
        current_user=current_user
    )

import views
