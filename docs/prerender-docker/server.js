/**
 * SEOLovable Prerender Service
 * 
 * Ce service reçoit les requêtes via Traefik et :
 * 1. Détecte si c'est un bot via User-Agent
 * 2. Récupère l'origin_url depuis Supabase
 * 3. Si bot → rend le HTML avec Puppeteer
 * 4. Si humain → proxy transparent vers l'origin
 */

const http = require('http');
const { createClient } = require('@supabase/supabase-js');
const puppeteer = require('puppeteer-core');

const PORT = process.env.PORT || 3000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate required env vars
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Bot detection patterns
const BOT_PATTERNS = [
  /googlebot/i,
  /bingbot/i,
  /slurp/i,
  /duckduckbot/i,
  /baiduspider/i,
  /yandexbot/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /linkedinbot/i,
  /whatsapp/i,
  /telegrambot/i,
  /discordbot/i,
  /applebot/i,
  /semrushbot/i,
  /ahrefsbot/i,
  /gptbot/i,
  /chatgpt/i,
  /claude/i,
  /anthropic/i,
  /petalbot/i,
  /bytespider/i,
];

function isBot(userAgent) {
  return BOT_PATTERNS.some(pattern => pattern.test(userAgent));
}

function getBotName(userAgent) {
  const ua = userAgent.toLowerCase();
  if (ua.includes('googlebot')) return 'Googlebot';
  if (ua.includes('bingbot')) return 'Bingbot';
  if (ua.includes('gptbot') || ua.includes('chatgpt')) return 'GPTBot';
  if (ua.includes('claude') || ua.includes('anthropic')) return 'ClaudeBot';
  if (ua.includes('facebookexternalhit')) return 'Facebook';
  if (ua.includes('twitterbot')) return 'Twitter';
  if (ua.includes('linkedinbot')) return 'LinkedIn';
  if (ua.includes('discordbot')) return 'Discord';
  if (ua.includes('whatsapp')) return 'WhatsApp';
  if (ua.includes('telegrambot')) return 'Telegram';
  return 'Other Bot';
}

function getBotType(botName) {
  const aiTypes = ['GPTBot', 'ClaudeBot'];
  return aiTypes.includes(botName) ? 'ai' : 'search';
}

function log(level, message, details = {}) {
  const timestamp = new Date().toISOString();
  console.log(JSON.stringify({ timestamp, level, message, ...details }));
}

// Puppeteer browser instance (reused for performance)
let browser = null;

async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--single-process',
      ],
    });
  }
  return browser;
}

async function prerenderPage(url, timeout = 30000) {
  const startTime = Date.now();
  const browser = await getBrowser();
  const page = await browser.newPage();
  
  try {
    await page.setUserAgent('SEOLovable Prerender Bot (+https://seolovable.cloud)');
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate and wait for network idle
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout,
    });
    
    // Wait a bit more for JS rendering
    await page.waitForTimeout(1000);
    
    const html = await page.content();
    const renderTime = Date.now() - startTime;
    
    return { html, renderTime };
  } finally {
    await page.close();
  }
}

async function proxyToOrigin(originUrl, req, res) {
  const url = new URL(originUrl);
  
  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: url.pathname + url.search,
    method: req.method,
    headers: {
      ...req.headers,
      host: url.host,
    },
  };
  
  const protocol = url.protocol === 'https:' ? require('https') : require('http');
  
  const proxyReq = protocol.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, {
      ...proxyRes.headers,
      'X-Prerender-Status': 'passthrough',
    });
    proxyRes.pipe(res);
  });
  
  proxyReq.on('error', (err) => {
    log('error', 'Proxy error', { error: err.message });
    res.writeHead(502);
    res.end('Bad Gateway');
  });
  
  req.pipe(proxyReq);
}

async function logCrawl(siteId, domain, url, userAgent, renderTimeMs) {
  try {
    const { data: site } = await supabase
      .from('sites')
      .select('prerender_token')
      .eq('id', siteId)
      .single();
    
    if (!site) return;
    
    const botName = getBotName(userAgent);
    const botType = getBotType(botName);
    
    await supabase.from('prerender_logs').insert({
      site_id: siteId,
      token: site.prerender_token,
      domain,
      url,
      user_agent: userAgent,
      bot_name: botName,
      bot_type: botType,
      render_time_ms: renderTimeMs,
      cached: false,
      source: 'vps_prerender',
    });
    
    await supabase.rpc('increment_pages_rendered', { site_id_param: siteId });
    
    log('info', 'Crawl logged', { siteId, domain, botName });
  } catch (error) {
    log('error', 'Error logging crawl', { error: error.message });
  }
}

const server = http.createServer(async (req, res) => {
  const startTime = Date.now();
  const host = req.headers.host?.split(':')[0]?.toLowerCase();
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const path = req.url || '/';
  
  log('info', 'Request received', { host, path, userAgent: userAgent.substring(0, 100) });
  
  // Health check endpoint
  if (path === '/health' || path === '/_health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }
  
  if (!host) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Missing Host header' }));
    return;
  }
  
  try {
    // Look up site in database
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('id, origin_url, url, status, dns_verified')
      .or(`url.ilike.%${host}%`)
      .maybeSingle();
    
    if (siteError) {
      log('error', 'Database error', { error: siteError.message });
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Database error' }));
      return;
    }
    
    if (!site) {
      log('warn', 'Site not found', { host });
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Site not configured', domain: host }));
      return;
    }
    
    if (!site.origin_url) {
      log('warn', 'No origin URL', { siteId: site.id });
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Origin URL not configured' }));
      return;
    }
    
    // Build target URL
    const originBase = site.origin_url.replace(/\/$/, '');
    const targetUrl = `${originBase}${path}`;
    
    log('info', 'Resolved origin', { siteId: site.id, targetUrl });
    
    // Check if bot
    if (isBot(userAgent)) {
      log('info', 'Bot detected, prerendering', { bot: getBotName(userAgent) });
      
      try {
        const { html, renderTime } = await prerenderPage(targetUrl);
        
        // Log crawl asynchronously
        logCrawl(site.id, host, targetUrl, userAgent, renderTime).catch(console.error);
        
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'X-Prerender-Status': 'rendered',
          'X-Render-Time': `${renderTime}ms`,
          'Cache-Control': 'public, max-age=86400',
        });
        res.end(html);
        
        log('info', 'Prerender success', { renderTime, htmlLength: html.length });
        return;
      } catch (prerenderError) {
        log('error', 'Prerender failed, falling back to origin', { error: prerenderError.message });
        // Fall through to proxy
      }
    }
    
    // Proxy to origin (human or prerender failed)
    log('info', 'Proxying to origin', { targetUrl });
    await proxyToOrigin(targetUrl, req, res);
    
  } catch (error) {
    log('error', 'Request error', { error: error.message });
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  log('info', 'Shutting down...');
  if (browser) {
    await browser.close();
  }
  server.close(() => {
    process.exit(0);
  });
});

server.listen(PORT, () => {
  log('info', `SEOLovable Prerender Service started on port ${PORT}`);
});
