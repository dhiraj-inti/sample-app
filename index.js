const express = require('express');
const fs = require('fs');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Middleware to parse JSON requests
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');});

// Route where all API traffic will come
app.post('/api', async (req, res) => {
    const { route } = req.body;
 
        if (route === '/balance') {
            const userId = req.body.userId;

            if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
            }
            try{
                const response = await axios.post('http://localhost:3000/balance', { userId })
                return res.json(response.data);
            }
            catch(error){
                if (error.response) {
                    res.status(error.response.status).json(error.response.data);
                    } else {
                    res.status(500).json({ error: 'Internal server error' });
                    }
            }
        } 
    else {
        res.status(400).json({ error: 'Invalid route' });
    }
});

// Endpoint to return current bank balance
app.post('/balance', (req, res) => {
    const userId = parseInt(req.body.userId, 10);

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    fs.readFile('data/user.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading user data' });
        }

        const users = JSON.parse(data);
        const user = users.find(u => u.userId === userId);
       
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const message = `Your current bank balance is ${user.currentBalance}`;
        return res.json({ message });
    });
});


// Endpoint to handle GitHub Actions webhook
app.post('/github-webhook', async (req, res) => {
    const webhookPayload = req.body;
    console.log("webhook called");
    console.log('Received GitHub Actions webhook:', webhookPayload);

    try {
        await axios.post('http://localhost:5000/contextualTesting', webhookPayload);
        res.status(200).json({ message: 'Webhook forwarded successfully' });
    } catch (error) {
        console.error('Error forwarding webhook:', error.message);
        res.status(500).json({ error: 'Failed to forward webhook' });
    }

});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});