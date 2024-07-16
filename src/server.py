from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask import Flask, request, jsonify, send_file, session
from flask_session import Session
import tempfile
import subprocess
import requests
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)


# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

app.config['SESSION_TYPE'] = 'sqlalchemy'
app.config['SESSION_SQLALCHEMY'] = db
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_USE_SIGNER'] = True
app.config['SESSION_KEY_PREFIX'] = 'session:'
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

Session(app)

# User model
class User(db.Model):
    __tablename__ = 'users'
    userid = db.Column(db.Integer, primary_key=True)
    firebase_uid = db.Column(db.String(255), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)

# Note model
class Note(db.Model):
    __tablename__ = 'notes'
    noteid = db.Column(db.Integer, primary_key=True)
    userid = db.Column(db.Integer, db.ForeignKey('users.userid'), nullable=False)
    notebody = db.Column(db.Text, nullable=False)

class SessionModel(db.Model):
    __tablename__ = 'sessions'
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(255), unique=True, nullable=False)
    data = db.Column(db.Text, nullable=False)
    expiry = db.Column(db.DateTime, nullable=False)

    __table_args__ = {'extend_existing': True}

# Initialize database
with app.app_context():
    db.create_all()

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    firebase_uid = data.get('firebase_uid')
    email = data.get('email')

    if not firebase_uid or not email:
        return jsonify({"error": "Firebase UID and email are required"}), 400

    user_exists = User.query.filter_by(firebase_uid=firebase_uid).first()
    if user_exists:
        return jsonify({"error": "User already exists"}), 400

    new_user = User(firebase_uid=firebase_uid, email=email)

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    uid = data.get('uid')
   

    if not uid:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(firebase_uid=uid).first()
    if user is None:
        return jsonify({"error": "User not found"}), 404

 
    # Create session
    session['user_id'] = user.userid
    session['firebase_uid'] = user.firebase_uid

    return jsonify({"message": "Logged in successfully"}), 200


@app.route('/api/logout', methods=['POST'])
def logout():
    try:
        session_id = request.cookies.get(app.session_cookie_name)
        if session_id:
            # Directly remove the session from the database
            session_model = db.session.query(SessionModel).filter_by(session_id=session_id).first()
            if session_model:
                db.session.delete(session_model)
                db.session.commit()

        session.pop('user_id', None)
        session.pop('firebase_uid', None)
        return jsonify({"message": "Logged out successfully"}), 200
    except Exception as e:
        print(f"Error during logout: {e}")
        return jsonify({"error": str(e)}), 500
    


@app.route('/api/tts', methods=['POST'])
def tts():
    try:
        data = request.json
        text = data.get('text', '')

        if not text:
            return jsonify({'error': 'No text provided'}), 400

        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_audio:
            temp_audio.close()
            espeak_path = 'espeak-ng'  # Assuming espeak-ng is in the PATH
            command = [espeak_path, '-w', temp_audio.name, text]
            subprocess.run(command, check=True)
            return send_file(temp_audio.name, mimetype='audio/wav', as_attachment=True)
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/definition', methods=['GET'])
def get_definition():
    try:
        word = request.args.get('word', '')
        if not word:
            return jsonify({'error': 'No word provided'}), 400

        # Replace with your dictionary API URL
        api_url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{word}"
        response = requests.get(api_url)

        if response.status_code != 200:
            return jsonify({'error': 'Error fetching definition'}), 500

        definition = response.json()
        return jsonify(definition)
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
    


