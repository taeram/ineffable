from app import app, \
                db
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
from app.forms.login import LoginForm
from app.forms.user import UserForm
from app.models.user import User

@app.route("/login", methods=["GET", "POST"])
def users_login():
    """ Login page """
    if current_user.is_authenticated():
        return redirect(url_for('gallery_home'))

    form = LoginForm()
    if form.validate_on_submit():
        user = User.find_by_name(form.username.data)
        if user is None or not user.is_valid_password(form.password.data):
            flash('Invalid username or password', 'danger')
        elif login_user(user, remember=form.remember.data):
            # Enable session expiration only if user hasn't chosen to be remembered.
            session.permanent = not form.remember.data
            return redirect(request.args.get('next') or url_for('gallery_home'))
    elif form.errors:
        flash('Invalid username or password', 'danger')

    return render_template('users/login.html', form=form)


@app.route('/logout')
@login_required
def users_logout():
    """ Logout the user """
    logout_user()
    return redirect(url_for('users_login'))


@app.route('/user/list/', methods=['GET'])
@login_required
def users_list():
    """ List all users """
    if not current_user.role == "admin":
        abort(404)

    users = User.find_all()

    return render_template('users/list.html',
        users=users,
        page_title="Users"
    )

@app.route('/user/add/', methods=['GET', 'POST'])
@login_required
def users_create():
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

        return redirect(url_for('users_list'))

    return render_template('users/create.html',
        form=form,
        page_title="Create a User",
        form_action=url_for('users_create'),
        form_submit_button_title="Create"
    )

@app.route('/user/update/<int:user_id>', methods=['GET', 'POST'])
@login_required
def users_update(user_id):
    """ Update a user """
    if not current_user.role == "admin":
        abort(404)

    user = User.find_by_id(user_id)
    if not user:
        abort(404)

    form = UserForm(obj=user)
    del form.password
    if request.method == 'POST' and form.validate_on_submit():
        user.name = form.name.data
        user.role = form.role.data

        db.session.add(user)
        db.session.commit()

        return redirect(url_for('users_list'))

    return render_template('users/update.html',
        user=user,
        form=form,
        page_title="Update %s" % user.name ,
        form_action=url_for('users_update', user_id=user.id),
        form_submit_button_title="Update"
    )

@app.route('/user/delete/<int:user_id>', methods=['GET'])
@login_required
def users_delete(user_id):
    """ Delete a user """
    if not current_user.role == "admin":
        abort(404)

    user = User.find_by_id(user_id)
    if not user:
        abort(404)

    db.session.delete(user)
    db.session.commit()

    return redirect(url_for('users_list'))


@app.route('/change-password/', methods=['GET', 'POST'])
@login_required
def users_change_password():
    """ Change a user's password """

    # Is this an admin resetting a user's password?
    if request.args.get('user_id'):
        user_id = request.args.get('user_id')

        if user_id != current_user.id and not current_user.role == "admin":
            abort(404)
    else:
        user_id = current_user.id

    user = User.find_by_id(user_id)
    if not user:
        abort(404)

    form = UserForm(obj=user)
    del form.name
    del form.role
    if request.method == 'POST' and form.validate_on_submit():
        user.set_password(form.password.data)

        db.session.add(user)
        db.session.commit()

        return redirect(url_for('users_change_password', user_id=user.id))

    if current_user.role == "admin":
        page_title = "Change password for %s" % user.name
    else:
        page_title = "Change your Password"

    return render_template('users/change_password.html',
        user=user,
        form=form,
        page_title=page_title,
        form_action=url_for('users_change_password', user_id=user.id),
        form_submit_button_title="Change"
    )
