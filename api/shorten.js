import { createClient } from '@supabase/supabase-js';

// 🔐 GANTI DENGAN CREDENTIAL LU!
const supabaseUrl = 'https://aqhhofsjhfpncyemltim.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxaGhvZnNqaGZwbmN5ZW1sdGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5ODgyMTEsImV4cCI6MjEwMDU2NDIxMX0.LYvZBxbcvaiSczEpG-s8fAnxAmqy5grp1gDMb6ogjyo';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL required' });

    // Validasi URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return res.status(400).json({ error: 'Invalid URL' });
    }

    try {
        // Cek apakah URL sudah pernah dishortir
        const { data: existing } = await supabase
            .from('links')
            .select('short_id')
            .eq('original_url', url)
            .maybeSingle();

        if (existing) {
            const short = `https://eraeshorten.vercel.app/${existing.short_id}`;
            return res.status(200).json({ short });
        }

        // Generate ID unik (6 karakter)
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let id = '';
        let exists = true;

        while (exists) {
            id = '';
            for (let i = 0; i < 6; i++) {
                id += chars[Math.floor(Math.random() * chars.length)];
            }
            const { data: check } = await supabase
                .from('links')
                .select('short_id')
                .eq('short_id', id)
                .maybeSingle();
            exists = !!check;
        }

        // Simpan ke Supabase
        const { error } = await supabase
            .from('links')
            .insert([{ short_id: id, original_url: url, created_at: new Date().toISOString() }]);

        if (error) throw error;

        const short = `https://eraeshorten.vercel.app/${id}`;
        return res.status(200).json({ short });

    } catch (err) {
        console.error('Supabase error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
