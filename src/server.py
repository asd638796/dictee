from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import tempfile
import subprocess
import requests

app = Flask(__name__)
CORS(app)

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
    app.run(port=5002)
