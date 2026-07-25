import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aqhhofsjhfpncyemltim.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxaGhvZnNqaGZwbmN5ZW1sdGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5ODgyMTEsImV4cCI6MjEwMDU2NDIxMX0.LYvZBxbcvaiSczEpG-s8fAnxAmqy5grp1gDMb6ogjyo';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    const { id } = req.query;
    if (!id) return res.status(400).send('Missing ID');

    try {
        const { data, error } = await supabase
            .from('links')
            .select('original_url')
            .eq('short_id', id)
            .maybeSingle();

        if (error || !data) {
            return res.status(404).send('Link tidak ditemukan');
        }

        // Update hit count (opsional)
        await supabase
            .from('links')
            .update({ hits: supabase.rpc('increment', { row_id: id }) })
            .eq('short_id', id);

        return res.redirect(302, data.original_url);

    } catch (err) {
        console.error('Redirect error:', err);
        return res.status(500).send('Internal error');
    }
}
