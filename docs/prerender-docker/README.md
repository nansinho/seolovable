# SEOLovable Prerender Service

Service de prerendering auto-hébergé pour SEOLovable. Ce service reçoit les requêtes via Traefik et rend automatiquement le HTML pour les bots (Google, GPT, etc.) tout en laissant passer les humains vers le site original.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (bot ou humain)                    │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              prerender.seolovable.cloud (VPS)                │
│                                                              │
│  ┌────────────┐     ┌─────────────────────────────────────┐ │
│  │  Traefik   │────▶│  SEOLovable Prerender Service       │ │
│  │  (TLS)     │     │                                      │ │
│  └────────────┘     │  1. Détecte le Host header           │ │
│                     │  2. Lookup origin_url dans Supabase  │ │
│                     │  3. Bot? → Puppeteer → HTML rendu   │ │
│                     │  4. Humain? → Proxy vers origin     │ │
│                     └───────────────────┬─────────────────┘ │
└─────────────────────────────────────────┼───────────────────┘
                                          │
                              ┌───────────┴───────────┐
                              ▼                       ▼
                    ┌──────────────────┐    ┌──────────────────┐
                    │  Origin Server   │    │    Supabase DB   │
                    │ (Vercel, etc.)   │    │   (sites table)  │
                    └──────────────────┘    └──────────────────┘
```

## Prérequis

- Docker et Docker Compose
- Traefik configuré avec Let's Encrypt
- Supabase project avec les credentials

## Installation

### 1. Configurer le DNS

Créez un enregistrement A pour `prerender.seolovable.cloud` pointant vers votre VPS :

```
Type: A
Nom: prerender
Valeur: <IP_DE_VOTRE_VPS>
```

### 2. Créer le fichier .env

```bash
cd /opt/prerender
nano .env
```

Contenu :
```env
SUPABASE_URL=https://dcjurgffzjpjxqpmqtkd.supabase.co
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
```

### 3. Déployer le service

```bash
# Cloner ou copier les fichiers
mkdir -p /opt/prerender
cd /opt/prerender

# Copier docker-compose.yml, Dockerfile, server.js, package.json
# ...

# Construire et démarrer
docker-compose up -d --build
```

### 4. Vérifier le déploiement

```bash
# Logs
docker-compose logs -f prerender

# Test health check
curl http://localhost:3000/health

# Test avec Traefik (doit retourner le HTML prérendu)
curl -H "User-Agent: Googlebot" https://prerender.seolovable.cloud/
```

## Configuration des clients

Une fois le service déployé, vos clients doivent :

1. **Ajouter leur site** dans le dashboard SEOLovable avec :
   - `url`: Le domaine principal (ex: `https://example.com`)
   - `origin_url`: Le serveur réel (ex: `https://example.vercel.app`)

2. **Configurer le DNS** :
   - Ajouter le TXT record pour la vérification
   - Après vérification, ajouter le CNAME : `example.com CNAME prerender.seolovable.cloud`

## Headers de réponse

Le service ajoute des headers pour le debugging :

- `X-Prerender-Status: rendered` → Le HTML a été prérendu par Puppeteer
- `X-Prerender-Status: passthrough` → Requête proxiée vers l'origin (humain)
- `X-Render-Time: 1234ms` → Temps de rendu Puppeteer

## Logs

Les logs sont au format JSON pour faciliter l'analyse :

```json
{
  "timestamp": "2024-01-15T12:00:00.000Z",
  "level": "info",
  "message": "Prerender success",
  "renderTime": 1234,
  "htmlLength": 45678
}
```

## Monitoring

Le service expose un endpoint `/health` qui retourne :

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

Configurez votre monitoring pour vérifier ce endpoint.

## Troubleshooting

### Le prerendering est lent

- Augmentez la RAM/CPU du container
- Vérifiez que le site origin répond rapidement
- Considérez un système de cache (Redis)

### Erreur "Site not configured"

- Vérifiez que le site est bien enregistré dans Supabase
- Vérifiez que le champ `url` contient bien le domaine

### Erreur "Origin URL not configured"

- Ajoutez l'`origin_url` dans le dashboard SEOLovable

### Puppeteer crash

- Vérifiez les ressources mémoire
- Augmentez les limites Docker si nécessaire
