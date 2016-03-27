from app import app
from flask import send_from_directory
import os
import re

@app.route('/static/js/<path:filename>', methods=['GET'])
def handle_cachebusted_js(filename):
    """ Handle cachebusted JavaScript requests """
    filename = re.sub(r"\-[0-9]+", "", filename)
    js_path = 'js/%s' % filename
    return send_from_directory(os.path.join(app.root_path, 'static'), js_path, mimetype='text/javascript')


@app.route('/static/css/<path:filename>', methods=['GET'])
def handle_cachebusted_css(filename):
    """ Handle cachebusted CSS requests """
    filename = re.sub(r"\-[0-9]+", "", filename)
    css_path = 'css/%s' % filename
    return send_from_directory(os.path.join(app.root_path, 'static'), css_path, mimetype='text/css')
