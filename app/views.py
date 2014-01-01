from app import app
import os
from flask import flash, \
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
from forms import LoginForm
from database import find_user_by_name

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'), 'favicon.png', mimetype='image/png')

@app.route('/', methods=['GET'])
@login_required
def home():
    return render_template('index.html')

@app.route("/login", methods=["GET", "POST"])
def login():
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
    logout_user()
    return redirect(url_for('login'))

if app.config['DEBUG']:

    """ Parse the JSX on the fly if we're in debug mode """
    @app.route('/static/js/<file>', methods=['GET'])
    def jsx(file):
        from react import jsx

        jsxPath = os.path.join(app.root_path, 'static/js/%sx' % file)
        try:
            js = jsx.transform(jsxPath)
            return app.response_class(response=js, mimetype='text/javascript')
        except jsx.TransformError as e:
            return app.response_class(response="%s" % e, status=500)
