from tornado.wsgi import WSGIContainer
from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop
import tornado.autoreload as autoreload
from app import app
from os import getenv

http_server = HTTPServer(WSGIContainer(app))

port = getenv('PORT', 5000)
http_server.listen(port)

io_loop = IOLoop.instance()

if app.config['DEBUG']:
    # Auto-reload on file change
    autoreload.start(io_loop)
try:
    io_loop.start()
except KeyboardInterrupt:
    pass
