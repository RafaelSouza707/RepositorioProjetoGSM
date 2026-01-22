from .usuarios_routes import usuarios_bp
from .filmes_routes import movie_bp

def register_routes(app):
    app.register_blueprint(usuarios_bp)
    app.register_blueprint(movie_bp)