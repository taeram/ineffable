from app import app
from flask import send_from_directory
import os

@app.route('/.well-known/<path:filename>', methods=['GET'])
def controller_helper_letsencrypt(filename):
    """ Return the letsencrypt file """
    return send_from_directory(os.path.join(app.root_path, 'static/.well-known'), filename)
