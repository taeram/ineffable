from app import app
import os
from flask import abort, \
                  flash, \
                  redirect, \
                  render_template, \
                  request, \
                  session, \
                  url_for
from flask.ext.login import current_user, \
                            login_user, \
                            logout_user, \
                            login_required
from .forms import LoginForm,\
                   GalleryForm,\
                   UserForm
from .database import find_user_by_name, \
                      find_gallery_all, \
                      find_gallery_by_id, \
                      find_user_by_id,\
                      find_user_all,\
                      db, \
                      Gallery, \
                      Photo, \
                      User
from .helpers import delete_photo
import json
import base64
import hmac
import hashlib
from url_decode import urldecode


@app.route('/', methods=['GET'])
@login_required
def home():
    """ Home page """
    if request.args.get('q'):
        search_query = request.args.get('q')
    else:
        search_query = ""

    return render_template('index.html', q=search_query)

    
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
    if current_user.role == "guest":
        abort(404)

    form = GalleryForm()
    if form.validate_on_submit():
        gallery = Gallery(
            name=form.name.data,
            created=form.date.data
        )
        db.session.add(gallery)
        db.session.commit()

        return redirect(url_for('gallery_upload', gallery_id=gallery.id))

    return render_template('gallery.html',
        form=form,
        page_title="Create an Album",
        form_action=url_for('gallery_create'),
        form_submit_button_title="Create"
    )


@app.route('/update/<int:gallery_id>', methods=['GET', 'POST'])
@login_required
def gallery_update(gallery_id):
    """ Updated a gallery """
    if current_user.role == "guest":
        abort(404)

    gallery = find_gallery_by_id(gallery_id)
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

            db.session.add(gallery)
            db.session.commit()

            return redirect(url_for('home'))

    return render_template('gallery.html',
        form=form,
        page_title="Update %s" % gallery.name,
        form_action=url_for('gallery_update', gallery_id=gallery.id),
        form_submit_button_title="Update"
    )


@app.route('/user/list/', methods=['GET'])
@login_required
def user_list():
    """ List all users """
    if not current_user.role == "admin":
        abort(404)

    users = find_user_all()

    return render_template('user_list.html',
        users=users,
        page_title="Users"
    )

@app.route('/user/add/', methods=['GET', 'POST'])
@login_required
def user_create():
    """ Create a user """
    if not current_user.role == "admin":
        abort(404)

    form = UserForm()
    if request.method == 'POST' and form.validate_on_submit():
        user = User(
            name = form.name.data,
            password = form.password.data,
            role = form.role.data
        )
        db.session.add(user)
        db.session.commit()

        return redirect(url_for('user_list'))

    return render_template('user_create.html',
        form=form,
        page_title="Create a User",
        form_action=url_for('user_create'),
        form_submit_button_title="Create"
    )

@app.route('/user/update/<int:user_id>', methods=['GET', 'POST'])
@login_required
def user_update(user_id):
    """ Update a user """
    if not current_user.role == "admin":
        abort(404)

    user = find_user_by_id(user_id)
    if not user:
        abort(404)

    form = UserForm(obj=user)
    del form.password
    if request.method == 'POST' and form.validate_on_submit():
        user.name = form.name.data
        user.role = form.role.data

        db.session.add(user)
        db.session.commit()

        return redirect(url_for('user_list'))

    return render_template('user_update.html',
        user=user,
        form=form,
        page_title="Update %s" % user.name ,
        form_action=url_for('user_update', user_id=user.id),
        form_submit_button_title="Update"
    )

@app.route('/user/delete/<int:user_id>', methods=['GET'])
@login_required
def user_delete(user_id):
    """ Delete a user """
    if not current_user.role == "admin":
        abort(404)

    user = find_user_by_id(user_id)
    if not user:
        abort(404)

    db.session.delete(user)
    db.session.commit()

    return redirect(url_for('user_list'))


@app.route('/change-password/', methods=['GET', 'POST'])
@login_required
def user_change_password():
    """ Change a user's password """

    # Is this an admin resetting a user's password?
    if request.args.get('user_id'):
        user_id = request.args.get('user_id')

        if user_id != current_user.id and not current_user.role == "admin":
            abort(404)
    else:
        user_id = current_user.id

    user = find_user_by_id(user_id)
    if not user:
        abort(404)

    form = UserForm(obj=user)
    del form.name
    del form.role
    if request.method == 'POST' and form.validate_on_submit():
        user.set_password(form.password.data)

        db.session.add(user)
        db.session.commit()

        return redirect(url_for('user_change_password', user_id=user.id))

    if current_user.role == "admin":
        page_title = "Change password for %s" % user.name
    else:
        page_title = "Change your Password"

    return render_template('user_change_password.html',
        user=user,
        form=form,
        page_title=page_title,
        form_action=url_for('user_change_password', user_id=user.id),
        form_submit_button_title="Change"
    )

@app.route('/upload/<int:gallery_id>')
@login_required
def gallery_upload(gallery_id):
    """ Upload photos to a gallery """
    if current_user.role == "guest":
        abort(404)

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
        page_title="Upload to %s" % gallery.name,
        s3_success_action_status=s3_success_action_status,
        max_upload_size=app.config['MAX_UPLOAD_SIZE']
    )

@app.route('/verify/<int:gallery_id>')
@login_required
def gallery_verify(gallery_id):
    """ Verify all thumbnails have been created for a gallery """
    if current_user.role == "guest":
        abort(404)

    return render_template('index.html')

@app.route('/verify/thumbnail/', methods=['POST'])
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

    limit = 5
    offset = (page_num - 1) * limit
    galleries = find_gallery_all(offset=offset, limit=limit, search_query=search_query)

    response = []
    for gallery in galleries:
        response.append(gallery.to_object())

    return app.response_class(response=json.dumps(response), mimetype='application/json')

@app.route('/rest/gallery/<int:gallery_id>', methods=['GET'])
@login_required
def gallery_get(gallery_id):
    """ Get a gallery """
    gallery = find_gallery_by_id(gallery_id)
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
    db.session.add(gallery)
    db.session.commit()

    response = gallery.to_object()

    return app.response_class(response=json.dumps(response), mimetype='application/json')

    
@app.route('/rest/gallery/<int:gallery_id>', methods=['DELETE'])
@login_required
def gallery_item(gallery_id):
    """ Get/update/delete an individual gallery """
    if current_user.role == "guest":
        abort(404)

    gallery = find_gallery_by_id(gallery_id)
    if not gallery:
        abort(404)

    if request.method == 'GET':
        response = gallery.to_object()
    elif request.method == 'DELETE':
        # Delete all photos from the gallery
        gallery.delete()

        # Delete the gallery from the database
        db.session.delete(gallery)
        db.session.commit()
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
        gallery_id=request.form['gallery_id'],
        owner_id=int(current_user.id),
        created=request.form['created']
    )

    # Save the updated photos JSON for this gallery
    photo.save()

    # Tell the thumbnail daemon to generate a thumbnail for this photo
    photo.generate_thumbnail()

    # Update the gallery modified date
    photo.gallery.updateModified()

    return app.response_class(response=json.dumps(photo.to_object()), mimetype='application/json')


@app.route('/rest/photo/<int:gallery_id>/<string:photo_id>', methods=['DELETE'])
@login_required
def photo_delete(gallery_id, photo_id):
    """ Delete a photo from a gallery """
    if current_user.role == "guest":
        abort(404)

    gallery = find_gallery_by_id(gallery_id)
    if not gallery:
        abort(404)

    response = []
    if not delete_photo(gallery.folder, photo_id):
        response = ["error"]

    # Update the gallery modified date
    gallery.updateModified()

    return app.response_class(response=json.dumps(response), mimetype='application/json')
