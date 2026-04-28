// One entry-point per site.
// Ports must match your kubectl port-forward commands.
const SITE_URLS = {
  SA:      'http://localhost:5001',
  MOZ:     'http://localhost:5002',
  MRU:     'http://localhost:5003',
  CONTROL: 'http://localhost:5004',
};

// site code → integer site_id used by the DB
export const SITE_IDS = { SA: 1, MOZ: 2, MRU: 3 };

// Mirror the server-side prefix logic so login is self-routing
function siteFromUsername(username = '') {
  const u = username.toLowerCase();
  if (u.startsWith('sa_'))      return 'SA';
  if (u.startsWith('moz_'))     return 'MOZ';
  if (u.startsWith('mru_'))     return 'MRU';
  if (u.startsWith('control_')) return 'CONTROL';
  return null;
}

function baseUrl(site) {
  const url = SITE_URLS[site?.toUpperCase()];
  if (!url) throw new Error(`Unknown site: "${site}"`);
  return url;
}

async function request(site, path, options = {}) {
  let res;

  // Step 1: catch network-level failures (port-forward not running, wrong port, CORS)
  try {
    res = await fetch(`${baseUrl(site)}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
  } catch (networkErr) {
    throw new Error(
      `Cannot reach ${site} server — is the port-forward running on ${baseUrl(site)}? ` +
      `(${networkErr.message})`
    );
  }

  // Step 2: read as text first — response may be HTML on error
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.error(
      `[api] Non-JSON from ${site}${path} (HTTP ${res.status}):`,
      text.slice(0, 500)
    );
    throw new Error(
      `Server returned non-JSON (HTTP ${res.status}). Check Flask logs.`
    );
  }

  // Step 3: surface application errors
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  login: (username, password, role) => {
    const site = siteFromUsername(username);
    if (!site) {
      return Promise.reject(
        new Error('Invalid username prefix. Use sa_, moz_, mru_, or control_')
      );
    }
    return request(site, '/login', {
      method: 'POST',
      body: JSON.stringify({ username, password, role }),
    });
  },

  // ── Trips ─────────────────────────────────────────────────────────────────
  getTrips: (site, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(site, `/trips${qs ? `?${qs}` : ''}`);
  },

  createTrip: (site, data) =>
    request(site, '/trip', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // ── Incidents ─────────────────────────────────────────────────────────────
  getIncidents: (site) => request(site, '/incidents'),

  createIncident: (site, data) =>
    request(site, '/incidents', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // ── Milestones ────────────────────────────────────────────────────────────
  getMilestones: (site) => request(site, '/milestones'),

  createMilestone: (site, data) =>
    request(site, '/milestones', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // ── Clearance ─────────────────────────────────────────────────────────────
  getClearances: (site) => request(site, '/clearances'),

  createClearance: (site, data) =>
    request(site, '/clearances', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // ── Handover ──────────────────────────────────────────────────────────────
  getHandovers: (site) => request(site, '/handovers'),

  createHandover: (site, data) =>
    request(site, '/handovers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};