from flask import Flask
from helpers.database.init_db import init_database
from flask_cors import CORS


def create_app():
    app = Flask(__name__)
    
    app.config.from_object("config")

    CORS(app) # -> Para permitir o acesso do react ao back-end;


    init_database()

    from .routes import register_routes
    register_routes(app)

    return app