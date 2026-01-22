from flask import Flask
from helpers.application import create_app
from flask import jsonify



app = create_app()


@app.route("/")
def home():
    return jsonify("API para projeto")

if __name__ == '__main__':

    app.run(debug=True)