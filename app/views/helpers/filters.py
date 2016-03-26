from app import app
from flask import request, \
                  url_for
from flask.ext.login import current_user


@app.context_processor
def utility_processor():
    """ Utility Processor filter """
    def navbar_link(endpoint, label, icon=None, login_required=False, anonymous_required=False):
        if login_required and not current_user.is_authenticated():
            return ''

        if anonymous_required and current_user.is_authenticated():
            return ''

        if endpoint == request.endpoint:
            active = 'active'
        else:
            active = None

        if icon is not None:
            iconEl = '<i class="fa fa-%s"></i>' % icon
        else:
            iconEl = None

        return '<li class="%s"><a href="%s">%s%s</a></li>' % (active, url_for(endpoint), iconEl, label)

    return dict(navbar_link=navbar_link)
