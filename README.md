Ineffable
========

Ineffable is a minimalist photo gallery.

Requirements
============
You'll need the following:

* A [Heroku](https://www.heroku.com/) account, if you want to deploy to Heroku.
* An [Amazon AWS](http://aws.amazon.com/) account, including your AWS Access Key and Secret Key
* An [Amazon S3](http://aws.amazon.com/s3/) bucket, for storing the images
* An [Amazon SQS](http://aws.amazon.com/sqs/) queue, for the thumbnail daemon
* A deployed copy of [thumbd](https://github.com/bcoe/thumbd) (the thumbnail daemon)

Setup
=====
Local development setup:
```bash
    # Clone the repo
    git clone https://github.com/taeram/ineffable.git
    cd ./ineffable

    # Setup and activate virtualenv
    virtualenv .venv
    source ./.venv/bin/activate

    # Install the pip requirements
    pip install -r requirements.txt

    # Create the development database (SQLite by default)
    python manage.py database create

    # Export the config variables
    export AWS_ACCESS_KEY_ID=secret \
           AWS_SECRET_ACCESS_KEY=secret \
           AWS_REGION=us-east-1 \
           AWS_S3_BUCKET=my-photo-bucket \
           AWS_SQS_QUEUE=abcdef \
           MAX_UPLOAD_SIZE=10485760 \
           SECRET_KEY=secret_key

    # Start the application, prefixing with the required environment variables
    python server.py
```

Heroku setup:
```bash
    # Clone the repo
    git clone https://github.com/taeram/dynamite.git
    cd ./dynamite/

    # Create your Heroku app, and the addons
    heroku apps:create
    heroku addons:add heroku-postgresql

    # Tell Heroku we need a custom buildpack (for python + nodejs)
    heroku config:add BUILDPACK_URL=https://github.com/ddollar/heroku-buildpack-multi.git

    # Promote your postgres database (your URL name may differ)
    heroku pg:promote HEROKU_POSTGRESQL_RED_URL

    # Set the flask environment
    heroku config:set FLASK_ENV=production

    # Set the application config
    heroku config:set AWS_ACCESS_KEY_ID=secret \
                      AWS_SECRET_ACCESS_KEY=secret \
                      AWS_REGION=us-east-1 \
                      AWS_S3_BUCKET=my-photo-bucket \
                      AWS_SQS_QUEUE=abcdef \
                      MAX_UPLOAD_SIZE=10485760 \
                      SECRET_KEY=secret_key

    # Create the production database
    heroku run python manage.py database create

    # Make sure Heroku runs the Python and Node.js buildpacks
    heroku config:add BUILDPACK_URL=https://github.com/ddollar/heroku-buildpack-multi.git

    # Push to Heroku
    git push heroku master
```
