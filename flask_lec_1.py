from flask import Flask

app = Flask(__name__)

@app.route("/")
def home():
    return "Hello, Flask! Your ML API is alive"

if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)


from flask import Flask 
app = Flask(__name__)

@app.route("/")
def home():
    return "Welcome to the flask App!"

@app.route("/about")
def about():
    return "This is a simple route example to About page."

@app.route("/contact")
def contact():
    return "<h2>contact Us</h2><p>Email: info@digiskills.pk</p>"

if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)