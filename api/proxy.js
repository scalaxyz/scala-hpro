/**
 * HAUSNATION — Odesli Proxy (Vercel Serverless Function)
 * Provider 2/3
 * 
 * Deploy:
 * 1. GitHub'da yeni repo oluştur
 * 2. Bu dosyayı api/proxy.js olarak koy
 * 3. vercel.json dosyasını root'a koy
 * 4. vercel.com'dan import et → Deploy
 * URL: https://PROJE-ADIN.vercel.app/api/proxy?url=SPOTIFY_URL
 */
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  const spotifyUrl = req.query.url;

  if (!spotifyUrl || !spotifyUrl.includes('spotify')) {
    return res.status(400).json({ error: 'Invalid or missing Spotify URL' });
  }

  try {
    const response = await fetch(
      `https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(spotifyUrl)}&userCountry=US&songIfSingle=true`,
      { headers: { 'User-Agent': 'HausnationVercel/1.0' } }
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: `upstream_${response.status}` });
    }

    const data = await response.json();
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).json(data);
  } catch (e) {
    return res.status(502).json({ error: 'fetch_failed', message: e.message });
  }
}
