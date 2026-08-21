# Déploiement Vercel — Natijati ENCG

## 1. Préparer Supabase

1. Créez un projet sur Supabase.
2. Ouvrez **SQL Editor** et exécutez le contenu de `supabase.sql`.
3. Dans **Project Settings → API**, copiez l’URL du projet et la clé `service_role`.

## 2. Variables Vercel

Ajoutez dans **Vercel → Project Settings → Environment Variables** :

- `NEXT_PUBLIC_SITE_URL` : l’URL finale du site
- `ADMIN_PASSWORD` : un mot de passe fort pour `/admin`
- `AUTH_SECRET` : une chaîne aléatoire longue
- `SUPABASE_URL` : l’URL Supabase
- `SUPABASE_SERVICE_ROLE_KEY` : la clé privée `service_role`

Ne publiez jamais `SUPABASE_SERVICE_ROLE_KEY` dans GitHub.

## 3. Déployer

Importez le dépôt GitHub dans Vercel. Vercel détectera Next.js automatiquement :

- Build command : `npm run build`
- Output : laisser vide
- Node.js : 22.x

Après le déploiement, ouvrez `/admin`, connectez-vous avec `ADMIN_PASSWORD`, puis enregistrez les premières données.
