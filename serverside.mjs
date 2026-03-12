import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Resend } from 'resend';


const resend = new Resend(process.env.RESEND_API_KEY);


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

// nsajlo database w send email ll new user clients 

app.post('/contact', async (req, res) => {
    const { name, phone, message } = req.body;

    const { data: existing, error: checkError } = await supabase
        .from('clientContacts')
        .select('phone')
        .eq('phone', phone);

    if (existing && existing.length > 0) {
        return res.status(400).json({ error: 'Phone number already registered' });
    }

    const { error } = await supabase
        .from('clientContacts')
        .insert([{ name, phone, message }]);

    if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to save' });
    }

    try {
        await resend.emails.send({
            from: 'NEW CLIENT <onboarding@resend.dev>',
            to: 'skhfitnesscoaching@gmail.com',
            subject: 'NEW CLIENT! 🎉',
            html: `<h2>client ${name}!</h2><p>Phone number ${phone}</p>`
        });
    } catch (e) {
        console.error('Email failed:', e);
    }

    res.status(200).json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});