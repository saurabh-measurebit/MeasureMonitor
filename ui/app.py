from flask import Flask, render_template, request, jsonify, redirect, url_for
import firebase_admin
from firebase_admin import credentials, firestore
import os
import json

app = Flask(__name__)

# Initialize Firebase Admin SDK if not already initialized
if not firebase_admin._apps:
    cred = credentials.Certificate('path/to/your/serviceAccountKey.json')  # You'll need to update this path
    firebase_admin.initialize_app(cred)

db = firestore.client()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/clients', methods=['GET'])
def get_clients():
    try:
        clients_ref = db.collection('clients')
        docs = clients_ref.stream()
        clients = []
        for doc in docs:
            client_data = doc.to_dict()
            client_data['id'] = doc.id
            clients.append(client_data)
        return jsonify({"status": "success", "clients": clients})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/clients', methods=['POST'])
def add_client():
    try:
        client_data = request.json
        doc_ref = db.collection('clients').document()
        doc_ref.set(client_data)
        return jsonify({"status": "success", "message": "Client added successfully", "id": doc_ref.id})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/clients/<client_id>', methods=['PUT'])
def update_client(client_id):
    try:
        client_data = request.json
        db.collection('clients').document(client_id).update(client_data)
        return jsonify({"status": "success", "message": "Client updated successfully"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/clients/<client_id>', methods=['DELETE'])
def delete_client(client_id):
    try:
        db.collection('clients').document(client_id).delete()
        return jsonify({"status": "success", "message": "Client deleted successfully"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
