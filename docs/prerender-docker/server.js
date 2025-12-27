/**
 * SEOLovable Prerender Service
 * 
 * Ce service tourne sur un VPS (via Coolify) et gère le prerendering des pages
 * pour les bots de moteurs de recherche et d'IA.
 * 
 * Architecture:
 * - Utilise Puppeteer pour rendre les pages JavaScript
 * - Communique avec Lovable Cloud via l'Edge Function prerender-api
 * - Ne nécessite que SUPABASE_URL et SUPABASE_ANON_KEY
 */

const http = require('http');
const puppeteer = require('puppeteer-core');

// Configuration
const PORT = process.env.PORT || 3000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Validation des variables d'environnement
if (!SUPABASE_URL) {
  console.error('❌ SUPABASE_URL is required');
  process.exit(1);
}

if (!SUPABASE_ANON_KEY) {
  console.error('❌ SUPABASE_ANON_KEY is required');
  process.exit(1);
}

// URL de l'Edge Function
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/prerender-api`;

console.log('🚀 Configuration:');
console.log(`   PORT: ${PORT}`);
console.log(`   SUPABASE_URL: ${SUPABASE_URL}`);
console.log(`   EDGE_FUNCTION_URL: ${EDGE_FUNCTION_URL}`);

// Bot detection patterns
const BOT_PATTERNS = [
  /googlebot/i,
  /bingbot/i,
  /slurp/i,
  /duckduckbot/i,
  /baiduspider/i,
  /yandexbot/i,
  /facebot/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /linkedinbot/i,
  /whatsapp/i,
  /telegrambot/i,
  /discordbot/i,
  /slackbot/i,
  /chatgpt/i,
  /gptbot/i,
  /oai-searchbot/i,
  /claude-web/i,
  /anthropic/i,
  /perplexitybot/i,
  /gemini/i,
  /google-extended/i,
  /cohere-ai/i,
];

function isBot(userAgent) {
  if (!userAgent) return false;
  return BOT_PATTERNS.some(pattern => pattern.test(userAgent));
}

function log(level, message, details = {}) {
  const timestamp = new Date().toISOString();
  console.log(JSON.stringify({ timestamp, level, message, ...details }));
}

// Browser management
let browser = null;

async function getBrowser() {
  if (!browser) {
    log('info', 'Launching Puppeteer browser...');
    browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
      ],
    });
    log('info', 'Browser launched');
  }
  return browser;
}

// Call Edge Function
async function callEdgeFunction(action, params) {
  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ action, ...params }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      log('error', 'Edge Function error', { status: response.status, error: errorText });
      return null;
    }

    return await response.json();
  } catch (error) {
    log('error', 'Edge Function call failed', { error: error.message });
    return null;
  }
}

// Lookup site by domain
async function lookupSite(domain) {
  log('info', 'Looking up site', { domain });
  const result = await callEdgeFunction('lookup', { domain });
  
  if (result?.found) {
    log('info', 'Site found', { site_id: result.site_id });
    return result;
  }
  
  log('warn', 'No site found', { domain });
  return null;
}

// Log crawl
async function logCrawl(siteId, domain, url, userAgent, renderTimeMs, cached = false) {
  log('info', 'Logging crawl', { site_id: siteId });
  await callEdgeFunction('log', {
    site_id: siteId,
    domain,
    url,
    user_agent: userAgent,
    render_time_ms: renderTimeMs,
    cached,
  });
}

// Prerender a page
async function prerenderPage(url) {
  const startTime = Date.now();
  log('info', 'Prerendering', { url });

  try {
    const browserInstance = await getBrowser();
    const page = await browserInstance.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (compatible; SEOLovableBot/1.0; +https://seolovable.cloud)'
    );

    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Wait for content to be ready
    await page.waitForSelector('body', { timeout: 5000 }).catch(() => {});
    
    // Additional wait for SPA content
    await new Promise(resolve => setTimeout(resolve, 1000));

    const html = await page.content();
    await page.close();

    const renderTime = Date.now() - startTime;
    log('info', 'Render complete', { renderTime, htmlLength: html.length });

    return { html, renderTime };
  } catch (error) {
    log('error', 'Prerender error', { url, error: error.message });
    throw error;
  }
}

// Proxy to origin
async function proxyToOrigin(originUrl, req, res) {
  log('info', 'Proxying to origin', { originUrl });

  try {
    const response = await fetch(originUrl, {
      method: req.method,
      headers: {
        'User-Agent': req.headers['user-agent'] || '',
        'Accept': req.headers['accept'] || '*/*',
      },
    });

    res.writeHead(response.status, {
      'Content-Type': response.headers.get('content-type') || 'text/html',
      'X-Proxied-By': 'SEOLovable',
    });

    const body = await response.text();
    res.end(body);
  } catch (error) {
    log('error', 'Proxy error', { error: error.message });
    res.writeHead(502);
    res.end('Bad Gateway');
  }
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  const startTime = Date.now();

  // Health check
  if (req.url === '/health' || req.url === '/_health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      browser: browser ? 'running' : 'not started'
    }));
    return;
  }

  // Get domain from Host header
  const host = req.headers.host;
  if (!host) {
    res.writeHead(400);
    res.end('Missing Host header');
    return;
  }

  const domain = host.split(':')[0];
  const userAgent = req.headers['user-agent'] || '';
  const requestUrl = `https://${host}${req.url}`;

  log('info', 'Request received', { 
    host, 
    path: req.url, 
    userAgent: userAgent.substring(0, 100) 
  });

  // Lookup site in database via Edge Function
  const siteData = await lookupSite(domain);

  if (!siteData) {
    log('warn', 'Site not configured', { domain });
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Site not configured', domain }));
    return;
  }

  const { site_id, origin_url } = siteData;

  if (!origin_url) {
    log('warn', 'No origin URL configured', { site_id });
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Origin URL not configured' }));
    return;
  }

  // Check if request is from a bot
  if (isBot(userAgent)) {
    log('info', 'Bot detected, prerendering...', { userAgent: userAgent.substring(0, 50) });

    try {
      // Build the URL to prerender (use origin_url + path)
      const urlPath = req.url || '/';
      const prerenderUrl = origin_url.replace(/\/$/, '') + urlPath;

      const { html, renderTime } = await prerenderPage(prerenderUrl);

      // Log the crawl asynchronously
      logCrawl(site_id, domain, requestUrl, userAgent, renderTime, false).catch(err => {
        log('error', 'Failed to log crawl', { error: err.message });
      });

      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Prerendered': 'true',
        'X-Render-Time': `${renderTime}ms`,
        'Cache-Control': 'public, max-age=86400',
      });
      res.end(html);
    } catch (error) {
      log('error', 'Prerender failed, proxying to origin', { error: error.message });
      await proxyToOrigin(origin_url + (req.url || '/'), req, res);
    }
  } else {
    // Regular user, proxy to origin
    log('info', 'Human detected, proxying to origin');
    await proxyToOrigin(origin_url + (req.url || '/'), req, res);
  }

  log('info', 'Request complete', { totalTime: Date.now() - startTime });
});

// Start server
server.listen(PORT, () => {
  log('info', `SEOLovable Prerender Service started on port ${PORT}`);
  log('info', `Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  log('info', 'Shutting down...');
  if (browser) {
    await browser.close();
  }
  server.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  log('info', 'Shutting down...');
  if (browser) {
    await browser.close();
  }
  server.close();
  process.exit(0);
});
