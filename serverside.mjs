import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key must be provided as environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log('Supabase client initialized successfully!');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'basepage.html'));
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'basepage.html'));
});

app.get('/shop', (req, res) => {
    res.sendFile(path.join(__dirname, 'shop.html'));
});

app.post('/contact', async (req, res) => {
    const { name, email, phone, message } = req.body;
    
    const { error } = await supabase
        .from('clientContacts')
        .insert([{ name, email, phone, message }]);
    
    if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to save' });
    }
    res.status(200).json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});