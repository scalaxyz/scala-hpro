export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  const { searchParams } = new URL(req.url);
  let spotifyUrl = searchParams.get('url');

  if (!spotifyUrl || !spotifyUrl.includes('spotify')) {
    return Response.json({ error: 'Invalid or missing Spotify URL', received: spotifyUrl }, { status: 400, headers: cors });
  }

  // Eğer hâlâ encoded geldiyse decode et (çift encoding koruması)
  if (spotifyUrl.includes('%3A') || spotifyUrl.includes('%2F')) {
    spotifyUrl = decodeURIComponent(spotifyUrl);
  }

  const target = `https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(spotifyUrl)}&userCountry=US&songIfSingle=true`;

  try {
    const res = await fetch(target, { headers: { 'User-Agent': 'HausnationVercel/1.0' } });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      return Response.json({ error: `upstream_${res.status}`, detail: errBody.slice(0, 300), debug_target: target }, { status: res.status, headers: cors });
    }

    return new Response(await res.text(), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...cors, 'Cache-Control': 'public, max-age=3600' },
    });
  } catch (e) {
    return Response.json({ error: 'fetch_failed', message: e.message }, { status: 502, headers: cors });
  }
}
