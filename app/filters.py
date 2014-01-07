from app import app
from flask import request, \
                  url_for
from flask.ext.login import current_user

@app.context_processor
def utility_processor():

    def navbar_link(endpoint, label, login_required=False, anonymous_required=False):
        if login_required and not current_user.is_authenticated():
            return ''

        if anonymous_required and current_user.is_authenticated():
            return ''

        if endpoint == request.endpoint:
            activeClass = 'class="active"'
        else:
            activeClass = ''

        return '<li %s><a href="%s">%s</a></li>' % (activeClass, url_for(endpoint), label)

    return dict(navbar_link=navbar_link)
