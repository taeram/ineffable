from app import app
from flask import abort, \
                  redirect, \
                  render_template, \
                  request, \
                  session, \
                  url_for
from flask.ext.login import current_user, \
                            login_user, \
                            login_required
from app.forms.gallery import GalleryForm
from app.models.gallery import Gallery
from app.models.photo import Photo
from app.models.user import User
import json
import base64
import hmac
import hashlib
from datetime import timedelta
from url_decode import urldecode


@app.route('/', methods=['GET'])
@login_required
def home():
    """ Home page """
    if request.args.get('q'):
        search_query = request.args.get('q')
    else:
        search_query = ""

    return render_template('gallery/index.html', q=search_query)


@app.route('/s/<string:share_code>')
def share(share_code):
    """ Show a shared album """
    if not current_user.is_authenticated():
        user = User(
            name="share",
            role="share",
            password="share"
        )
        login_user(user)
        session.permanent = False
        app.permanent_session_lifetime = timedelta(minutes=1)

    gallery = Gallery.find_by_share_code(share_code)
    if not gallery:
        abort(404)

    return render_template('gallery/index.html', json=json.dumps(gallery.to_object()), page_title=response['name'], og_photo_url=og_photo_url)


@app.route('/gallery/create/', methods=['GET', 'POST'])
@login_required
def gallery_create():
    """ Create a gallery """
    if current_user.role == "guest":
        abort(404)

    form = GalleryForm()
    if form.validate_on_submit():
        gallery = Gallery(
            name=form.name.data,
            created=form.date.data
        )
        gallery.save()

        return redirect(url_for('gallery_upload', gallery_id=gallery.id))

    return render_template('gallery/update.html',
        form=form,
        page_title="Create an Album",
        form_action=url_for('gallery_create'),
        form_submit_button_title="Create"
    )


@app.route('/gallery/update/<int:gallery_id>', methods=['GET', 'POST'])
@login_required
def gallery_update(gallery_id):
    """ Updated a gallery """
    if current_user.role == "guest":
        abort(404)

    gallery = Gallery.find_by_id(gallery_id)
    if not gallery:
        abort(404)

    if request.method == 'GET':
        form = GalleryForm(
            name=gallery.name,
            date=gallery.created
        )
    elif request.method == 'POST':
        form = GalleryForm()
        if form.validate_on_submit():
            gallery.name = form.name.data
            gallery.created = form.date.data
            gallery.save()

            return redirect(url_for('home'))

    return render_template('gallery/update.html',
        form=form,
        page_title="Update %s" % gallery.name,
        form_action=url_for('gallery_update', gallery_id=gallery.id),
        form_submit_button_title="Update"
    )

@app.route('/gallery/upload/<int:gallery_id>')
@login_required
def gallery_upload(gallery_id):
    """ Upload photos to a gallery """
    if current_user.role == "guest":
        abort(404)

    gallery = Gallery.find_by_id(gallery_id)
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

    return render_template('gallery/upload.html',
        gallery=gallery,
        aws_access_key_id=app.config['AWS_ACCESS_KEY_ID'],
        s3_acl=s3_acl,
        s3_bucket=app.config['AWS_S3_BUCKET'],
        s3_folder=folder,
        s3_policy=policy,
        s3_signature=signature,
        page_title="Upload to %s" % gallery.name,
        s3_success_action_status=s3_success_action_status,
        max_upload_size=app.config['MAX_UPLOAD_SIZE']
    )

@app.route('/gallery/verify/<int:gallery_id>')
@login_required
def gallery_verify(gallery_id):
    """ Verify all thumbnails have been created for a gallery """
    if current_user.role == "guest":
        abort(404)

    return render_template('gallery/index.html')

@app.route('/gallery/verify/thumbnail/', methods=['POST'])
@login_required
def photo_thumbnail():
    """ Add a photo to a gallery """
    if current_user.role == "guest":
        abort(404)

    photo = Photo(
        name=urldecode(request.form['name']),
        ext=request.form['ext'],
        gallery_id=request.form['gallery_id'],
        aspect_ratio=1.0,
        owner_id=1,
        created="2000:01:01 00:00:00"
    )

    # Tell the thumbnail daemon to generate a thumbnail for this photo
    photo.generate_thumbnail()

    return app.response_class(response="[]", mimetype='application/json')

@app.route('/rest/gallery/', methods=['GET'])
@login_required
def gallery_index():
    """ List all galleries """
    if not request.args.get('page'):
        abort(500)
    page_num = int(request.args.get('page'))

    if request.args.get('q'):
        search_query = request.args.get('q')
    else:
        search_query = None

    limit = app.config['GALLERIES_PER_PAGE']
    offset = (page_num - 1) * limit
    galleries = Gallery.find_all(offset=offset, limit=limit, search_query=search_query)

    response = []
    for gallery in galleries:
        response.append(gallery.to_object())

    return app.response_class(response=json.dumps(response), mimetype='application/json')

@app.route('/rest/gallery/<int:gallery_id>', methods=['GET'])
@login_required
def gallery_get(gallery_id):
    """ Get a gallery """
    gallery = Gallery.find_by_id(gallery_id)
    if not gallery:
        abort(404)

    return app.response_class(response=json.dumps(gallery.to_object()), mimetype='application/json')

@app.route('/rest/gallery/', methods=['POST'])
@login_required
def gallery_post():
    """ Add a new gallery """
    if current_user.role == "guest":
        abort(404)

    gallery = Gallery(name=request.form['name'])
    gallery.save()

    response = gallery.to_object()

    return app.response_class(response=json.dumps(response), mimetype='application/json')


@app.route('/rest/gallery/<int:gallery_id>', methods=['DELETE'])
@login_required
def gallery_item(gallery_id):
    """ Get/update/delete an individual gallery """
    if current_user.role == "guest":
        abort(404)

    gallery = Gallery.find_by_id(gallery_id)
    if not gallery:
        abort(404)

    if request.method == 'GET':
        response = gallery.to_object()
    elif request.method == 'DELETE':
        # Delete all photos from the gallery
        gallery.delete()

        # Delete the gallery from the database
        gallery.delete()
        response = []

    return app.response_class(response=json.dumps(response), mimetype='application/json')


@app.route('/rest/photo/', methods=['POST'])
@login_required
def photo_post():
    """ Add a photo to a gallery """
    if current_user.role == "guest":
        abort(404)

    photo = Photo(
        name=urldecode(request.form['name']),
        ext=request.form['ext'],
        aspect_ratio=float(request.form['aspect_ratio']),
        gallery=Gallery.find_by_id(request.form['gallery_id']),
        owner=current_user,
        created=request.form['created']
    )

    # Save the updated photos JSON for this gallery
    photo.save()

    # Tell the thumbnail daemon to generate a thumbnail for this photo
    photo.generate_thumbnail()

    # Update the gallery modified date
    photo.gallery.update_modified()

    return app.response_class(response=json.dumps(photo.to_object()), mimetype='application/json')


@app.route('/rest/photo/<int:gallery_id>/<string:photo_id>', methods=['DELETE'])
@login_required
def photo_delete(gallery_id, photo_id):
    """ Delete a photo from a gallery """
    if current_user.role == "guest":
        abort(404)

    photo = Photo.find_by_id(photo_id)
    if not photo:
        abort(404)

    response = []
    if not photo.delete():
        response = ["error"]

    return app.response_class(response=json.dumps(response), mimetype='application/json')
