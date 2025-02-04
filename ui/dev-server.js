const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Firebase Admin with environment variables
let firebaseConfig;
if (process.env.NODE_ENV === 'production') {
    firebaseConfig = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL
    };
} else {
    // For local development, use service account key file
    firebaseConfig = require('./serviceAccountKey.json');
}

admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig)
});

const db = admin.firestore();

// API endpoints
app.get('/api/clients', async (req, res) => {
    try {
        console.log('Fetching clients...');
        const snapshot = await db.collection('clients').get();
        const clients = [];
        console.log('Total documents:', snapshot.size);
        
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log('Document ID:', doc.id);
            console.log('Raw document data:', data);
            
            const client = { 
                id: doc.id,
                name: doc.id,
                project_id: data.project_id || '',
                projectId: data.project_id || '',
                ga_property_id: data.ga_property_id || '',
                gaPropertyId: data.ga_property_id || '',
                events_list: Array.isArray(data.events_list) ? data.events_list : [],
                eventsList: Array.isArray(data.events_list) ? data.events_list : [],
                min_average: typeof data.min_average === 'number' ? data.min_average : 0,
                minAverage: typeof data.min_average === 'number' ? data.min_average : 0,
                std_dev_multiplier: typeof data.std_dev_multiplier === 'number' ? data.std_dev_multiplier : 0,
                stdDevMultiplier: typeof data.std_dev_multiplier === 'number' ? data.std_dev_multiplier : 0,
                threshold_percentage: typeof data.threshold_percentage === 'number' ? data.threshold_percentage : 0,
                thresholdPercentage: typeof data.threshold_percentage === 'number' ? data.threshold_percentage : 0,
                event_configs: data.event_configs || {},
                eventConfigs: data.event_configs || {}
            };
            
            console.log('Processed client object:', client);
            clients.push(client);
        });
        
        console.log('Final clients array:', clients);
        res.json({ status: 'success', clients });
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.get('/api/clients/:id', async (req, res) => {
    try {
        const doc = await db.collection('clients').doc(req.params.id).get();
        if (!doc.exists) {
            res.status(404).json({ status: 'error', message: 'Client not found' });
            return;
        }
        const data = doc.data();
        const client = {
            id: doc.id,
            name: doc.id,
            project_id: data.project_id || '',
            ga_property_id: data.ga_property_id || '',
            events_list: Array.isArray(data.events_list) ? data.events_list : [],
            min_average: typeof data.min_average === 'number' ? data.min_average : 0,
            std_dev_multiplier: typeof data.std_dev_multiplier === 'number' ? data.std_dev_multiplier : 0,
            threshold_percentage: typeof data.threshold_percentage === 'number' ? data.threshold_percentage : 0,
            event_configs: data.event_configs || {}
        };
        res.json({ status: 'success', client });
    } catch (error) {
        console.error('Error fetching client:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.post('/api/clients', async (req, res) => {
    try {
        const { name, project_id, ga_property_id, events_list, min_average, std_dev_multiplier, threshold_percentage, event_configs } = req.body;
        
        // Validate required fields
        if (!name || !project_id || !ga_property_id) {
            res.status(400).json({ status: 'error', message: 'Name, Project ID, and GA Property ID are required' });
            return;
        }

        // Create the client document with the client ID as the document ID
        const clientRef = db.collection('clients').doc(name);
        await clientRef.set({
            project_id,
            ga_property_id,
            events_list: Array.isArray(events_list) ? events_list : [],
            min_average: typeof min_average === 'number' ? min_average : 0,
            std_dev_multiplier: typeof std_dev_multiplier === 'number' ? std_dev_multiplier : 0,
            threshold_percentage: typeof threshold_percentage === 'number' ? threshold_percentage : 0,
            event_configs: event_configs || {}
        });

        res.json({ status: 'success', message: 'Client created successfully', id: name });
    } catch (error) {
        console.error('Error creating client:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.put('/api/clients/:id', async (req, res) => {
    try {
        const { project_id, ga_property_id, events_list, min_average, std_dev_multiplier, threshold_percentage, event_configs } = req.body;
        
        // Validate required fields
        if (!project_id || !ga_property_id) {
            res.status(400).json({ status: 'error', message: 'Project ID and GA Property ID are required' });
            return;
        }

        const clientRef = db.collection('clients').doc(req.params.id);
        const doc = await clientRef.get();
        
        if (!doc.exists) {
            res.status(404).json({ status: 'error', message: 'Client not found' });
            return;
        }

        await clientRef.update({
            project_id,
            ga_property_id,
            events_list: Array.isArray(events_list) ? events_list : [],
            min_average: typeof min_average === 'number' ? min_average : 0,
            std_dev_multiplier: typeof std_dev_multiplier === 'number' ? std_dev_multiplier : 0,
            threshold_percentage: typeof threshold_percentage === 'number' ? threshold_percentage : 0,
            event_configs: event_configs || {}
        });

        res.json({ status: 'success', message: 'Client updated successfully' });
    } catch (error) {
        console.error('Error updating client:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.delete('/api/clients/:id', async (req, res) => {
    try {
        console.log('Deleting client:', req.params.id);
        await db.collection('clients').doc(req.params.id).delete();
        console.log('Client deleted successfully:', req.params.id);
        res.json({ status: 'success', message: 'Client deleted successfully' });
    } catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Development server running on http://localhost:${PORT}`);
});
