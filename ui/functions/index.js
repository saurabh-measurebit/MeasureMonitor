const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));

// Get all clients
app.get('/api/clients', async (req, res) => {
    try {
        const snapshot = await db.collection('clients').get();
        const clients = [];
        snapshot.forEach(doc => {
            clients.push({ id: doc.id, ...doc.data() });
        });
        res.json({ status: 'success', clients });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Add new client
app.post('/api/clients', async (req, res) => {
    try {
        const docRef = await db.collection('clients').add(req.body);
        res.json({ 
            status: 'success', 
            message: 'Client added successfully',
            id: docRef.id 
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Update client
app.put('/api/clients/:id', async (req, res) => {
    try {
        await db.collection('clients').doc(req.params.id).update(req.body);
        res.json({ status: 'success', message: 'Client updated successfully' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Delete client
app.delete('/api/clients/:id', async (req, res) => {
    try {
        await db.collection('clients').doc(req.params.id).delete();
        res.json({ status: 'success', message: 'Client deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Serve static files
app.use(express.static('public'));

exports.app = functions.https.onRequest(app);
