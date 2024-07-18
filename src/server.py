from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask import Flask, request, jsonify, send_file
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, unset_jwt_cookies, get_csrf_token
import tempfile
import subprocess
import requests
from dotenv import load_dotenv
import os
from nanoid import generate

load_dotenv()

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['JWT_TOKEN_LOCATION'] = ['cookies']
app.config['JWT_COOKIE_CSRF_PROTECT'] = True

jwt = JWTManager(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# User model
class User(db.Model):
    __tablename__ = 'users'
    userid = db.Column(db.Integer, primary_key=True)
    firebase_uid = db.Column(db.String(255), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)

# Note model
class Note(db.Model):
    __tablename__ = 'notes'
    noteid = db.Column(db.String(255), primary_key=True)
    userid = db.Column(db.Integer, db.ForeignKey('users.userid'), nullable=False)
    notebody = db.Column(db.Text, nullable=False)
    title = db.Column(db.String(255), nullable=False, default='New Note Title')

CORS(app, supports_credentials=True)

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

        default_note = Note(
            noteid=generate(size=21),
            userid=new_user.userid,
            title="New Note Title",
            notebody=""

        )
        db.session.add(default_note)
        db.session.commit()

        return jsonify({}), 201
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
    
    access_token = create_access_token(identity={'uid': user.firebase_uid})
    csrf_token = get_csrf_token(encoded_token=access_token)

    # Set JWT token in a cookie
    response = jsonify({})
    response.set_cookie('access_token_cookie', access_token, httponly=True, secure=True)
    response.set_cookie('csrf_access_token', csrf_token, httponly=False, secure=True)
    return response, 200


@app.route('/api/notes', methods=['GET'])
@jwt_required()
def get_notes():
    user_identity = get_jwt_identity()
    user = User.query.filter_by(firebase_uid=user_identity['uid']).first()

    if user is None:
        return jsonify({"error": "User not found"}), 404

    notes = Note.query.filter_by(userid=user.userid).all()
    notes_list = [{"id": note.noteid, "title": note.title, "body": note.notebody} for note in notes]
    return jsonify(notes_list), 200


@app.route('/api/logout', methods=['POST'])
@jwt_required()
def logout():
    user_identity = get_jwt_identity()
    user = User.query.filter_by(firebase_uid=user_identity['uid']).first()

    if user is None:
        return jsonify({"error": "User not found"}), 404

    # Delete all existing notes for the user
    Note.query.filter_by(userid=user.userid).delete()

    # Get notes data from the request
    notes_data = request.json.get('notes', [])
    for note in notes_data:
        new_note = Note(
            noteid=note.get('id'),
            userid=user.userid,
            title=note.get('title', 'New Note Title'),
            notebody=note.get('body', '')
        )
        db.session.add(new_note)

    db.session.commit()

    response = jsonify({})
    unset_jwt_cookies(response)
    return response, 200


@app.route('/api/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200



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
    


