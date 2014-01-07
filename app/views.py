from app import app
import os
import subprocess
from flask import abort, \
                  flash, \
                  redirect, \
                  render_template, \
                  request, \
                  send_from_directory, \
                  session, \
                  url_for
from flask.ext.login import current_user, \
                            login_user, \
                            logout_user, \
                            login_required
from .forms import LoginForm,\
                  CreateGalleryForm
from .database import find_user_by_name, \
                      find_gallery_all, \
                      find_gallery_by_id, \
                      find_photo_by_id, \
                      db, \
                      Gallery, \
                      Photo
import json
import base64
import hmac, hashlib
from react import jsx
from helpers import generate_thumbnail
from url_decode import urldecode

@app.route('/favicon.ico')
def favicon():
    """ Return the favicon """
    return send_from_directory(os.path.join(app.root_path, 'static'), 'favicon.png', mimetype='image/png')

if app.debug:
    @app.route('/static/js/<filename>', methods=['GET'])
    def compile_jsx(filename):
        """ Parse the JSX on the fly if we're in debug mode """
        jsx_path = os.path.join(app.root_path, 'static/js/%sx' % filename)
        try:
            js = jsx.transform(jsx_path)
            return app.response_class(response=js, mimetype='text/javascript')
        except jsx.TransformError as e:
            return app.response_class(response="%s" % e, status=500)

    @app.route('/static/css/<filename>', methods=['GET'])
    def compile_less(filename):
        """ Parse the LESS on the fly if we're in debug mode """
        filename = filename.replace('.css', '.less')
        less_path = os.path.join(app.root_path, 'static/css/%s' % filename)
        try:
            css = subprocess.check_output(['/usr/bin/lessc', less_path])
            return app.response_class(response=css, mimetype='text/css')
        except jsx.TransformError as e:
            return app.response_class(response="%s" % e, status=500)

@app.route('/', methods=['GET'])
@login_required
def home():
    """ Home page """
    return render_template('index.html')

@app.route('/<int:id>-<name>', methods=['GET'])
@login_required
def home_gallery(id, name):
    """ Home page """
    return render_template('index.html')

@app.route("/login", methods=["GET", "POST"])
def login():
    """ Login page """
    if current_user.is_authenticated():
        return redirect(url_for('home'))

    form = LoginForm()
    if form.validate_on_submit():
        user = find_user_by_name(form.username.data)
        if user is None or not user.is_valid_password(form.password.data):
            flash('Invalid username or password', 'danger')
        elif login_user(user, remember=form.remember.data):
            # Enable session expiration only if user hasn't chosen to be remembered.
            session.permanent = not form.remember.data
            return redirect(request.args.get('next') or url_for('home'))
    elif form.errors:
        flash('Invalid username or password', 'danger')

    return render_template('login.html', form=form)

@app.route('/logout')
@login_required
def logout():
    """ Logout the user """
    logout_user()
    return redirect(url_for('login'))

@app.route('/create/', methods=['GET', 'POST'])
@login_required
def gallery_create():
    """ Create a gallery """
    form = CreateGalleryForm()
    if form.validate_on_submit():
        gallery = Gallery(name=form.name.data)
        db.session.add(gallery)
        db.session.commit()

        return redirect(url_for('gallery_upload', gallery_id=gallery.id))

    return render_template('create.html', form=form)

@app.route('/upload/<int:gallery_id>')
def gallery_upload(gallery_id):
    """ Upload photos to a gallery """
    gallery = find_gallery_by_id(gallery_id)
    if not gallery:
        abort(404)

    s3_success_action_status = '201'
    s3_acl = "public-read"
    folder = "%s/" % gallery.folder
    s3_policy = {
        "expiration": "2038-01-01T00:00:00Z",
        "conditions": [
            {"bucket": app.config['AWS_S3_BUCKET']},
            ["starts-with", "$key", folder],
            {"acl": s3_acl},
            {"success_action_status": s3_success_action_status},
            ["content-length-range", 0, app.config['MAX_UPLOAD_SIZE']]
        ]
    }

    policy = base64.b64encode(json.dumps(s3_policy))
    signature = base64.b64encode(hmac.new(app.config['AWS_SECRET_ACCESS_KEY'], policy, hashlib.sha1).digest())

    return render_template('upload.html',
        gallery=gallery,
        aws_access_key_id=app.config['AWS_ACCESS_KEY_ID'],
        s3_acl=s3_acl,
        s3_bucket=app.config['AWS_S3_BUCKET'],
        s3_folder=folder,
        s3_policy=policy,
        s3_signature=signature,
        s3_success_action_status=s3_success_action_status,
        max_upload_size=app.config['MAX_UPLOAD_SIZE']
    )

@app.route('/rest/gallery/', methods=['GET', 'POST'])
@login_required
def gallery_index():
    """ List all galleries, or add a new one """
    if request.method == 'GET':
        galleries = find_gallery_all()

        response = []
        for gallery in galleries:
            response.append(gallery.to_object())
    elif request.method == 'POST':
        gallery = Gallery(name=request.form['name'])
        db.session.add(gallery)
        db.session.commit()

        response = gallery.to_object()

    return app.response_class(response=json.dumps(response), mimetype='application/json')

@app.route('/rest/gallery/<int:gallery_id>', methods=['GET', 'PUT', 'DELETE'])
@login_required
def gallery_item(gallery_id):
    """ Get/update/delete an individual gallery """
    gallery = find_gallery_by_id(gallery_id)
    if not gallery:
        abort(404)

    if request.method == 'GET':
        response = gallery.to_object()
    elif request.method == 'PUT':

        if 'name' in request.form:
            gallery.name = request.form['name']

        if 'folder' in request.form:
            gallery.folder = request.form['folder']

        db.session.add(gallery)
        db.session.commit()
        response = gallery.to_object()
    elif request.method == 'DELETE':
        db.session.delete(gallery)
        db.session.commit()
        response = []

    return app.response_class(response=json.dumps(response), mimetype='application/json')

@app.route('/rest/photo/', methods=['POST'])
@login_required
def photo_index():
    """ Add a photo to a gallery """
    photo = Photo(
        name=urldecode(request.form['name']),
        ext=request.form['ext'],
        aspect_ratio=request.form['aspect_ratio'],
        gallery_id=request.form['gallery_id'],
        owner_id=current_user.id
    )
    db.session.add(photo)
    db.session.commit()

    # Tell the thumbnail daemon to generate a thumbnail for this photo
    gallery = find_gallery_by_id(photo.gallery_id)
    photo_path = "%s/%s.%s" % (gallery.folder, photo.name, photo.ext)
    generate_thumbnail(photo_path)

    response = photo.to_object()
    return app.response_class(response=json.dumps(response), mimetype='application/json')

@app.route('/rest/photo/<int:photo_id>', methods=['GET', 'DELETE'])
@login_required
def photo_item(photo_id):
    photo = find_photo_by_id(photo_id)
    if not photo:
        abort(404)

    if request.method == 'GET':
        response = photo.to_object()
    elif request.method == 'PUT':
        photo.name = request.form['name']
        db.session.add(photo)
        db.session.commit()
        response = photo.to_object()
    elif request.method == 'DELETE':
        db.session.delete(photo)
        db.session.commit()
        response = []

    return app.response_class(response=json.dumps(response), mimetype='application/json')
