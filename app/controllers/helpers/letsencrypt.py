from app import app
from flask import send_from_directory
import os


@app.route('/.well-known/acme-challenge/<filename>', methods=['GET'])
def controller_helper_letsencrypt(filename):
    """ Return the letsencrypt file """
    return send_from_directory(os.path.join(app.root_path, '../.well-known/acme-challenge/'), filename)
