from app import app
from flask import send_from_directory
import os

@app.route('/favicon.ico')
def controller_helper_favicon():
    """ Return the favicon """
    return send_from_directory(os.path.join(app.root_path, 'static'), 'favicon/favicon-32x32.png', mimetype='image/png')


@app.route('/static/favicon-<int:cachebuster>.png', methods=['GET'])
def handle_cachebusted_favicon(cachebuster):
    """ Handle a cachebusted favicon request """
    return send_from_directory(os.path.join(app.root_path, 'static'), 'favicon.png', mimetype='image/png')


@app.route('/apple-touch-icon-precomposed.png')
def controller_helper_favicon_apple():
    """ Return the favicon """
    return send_from_directory(os.path.join(app.root_path, 'static'), 'favicon/apple-touch-icon-precomposed.png', mimetype='image/png')
