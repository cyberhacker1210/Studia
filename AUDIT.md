# 🔍 Audit de Studia

**Date :** 26 août 2026
**Périmètre :** `backend/` (FastAPI + OpenAI + Supabase) et `frontend/` (Next.js 16 + Clerk + Supabase)
**Commit audité :** `612fb67`

---

## Résumé exécutif

| Domaine | Verdict |
|---|---|
| Sécurité | 🔴 **Critique** — la logique métier (premium, énergie, XP) est 100 % côté client, un webhook de paiement n'est pas vérifié, un mot de passe admin par défaut est codé en dur |
| Fiabilité | 🟠 **Moyen** — 6 endpoints exposent des fonctions stub qui renvoient `{}`, configuration de ports incohérente |
| Hygiène repo | 🟠 **Moyen** — `node_modules` et `__pycache__` committés, fichiers morts, dépendance native `canvas` inutile en runtime |
| Tests / CI | 🔴 **Aucun test, aucune CI** |
| Qualité IA | 🟢 **Bonne** — prompts JSON stricts, boucles d'auto-validation des quiz |

**Note globale : 5,5/10** — l'architecture est saine et lisible, mais l'application ne doit **pas être mise en production telle quelle** : le modèle économique (premium) et l'intégrité des données sont contournables par n'importe quel utilisateur.

---

## 🔴 CRITIQUE — à corriger avant tout déploiement

### C1. Le premium, l'énergie et l'XP sont accordés côté client (Supabase clé anon)
Le navigateur écrit directement dans la table `users` avec la clé publique Supabase :
- `frontend/lib/subscriptionService.ts` → `activatePremium()` met `is_premium: true` + `plan_type` + `premium_until` **directement depuis le client**, avec le commentaire *« Simule un retour Stripe réussi »*.
- `frontend/components/workspace/ReferralHandler.tsx` → n'importe qui peut passer `referred_by` et **donner +5 d'énergie à n'importe quel compte** en posant une valeur dans `localStorage`.
- `frontend/lib/gamificationService.ts` → `addXp()` écrit `xp`, `level`, `streak_days` depuis le navigateur.
- `frontend/hooks/useEnergy.ts` → lit/écrit `energy` côté client.

👉 Si les politiques RLS de Supabase autorisent un utilisateur à modifier sa propre ligne (cas typique), **tout le monde peut se passer premium, se donner 999 éclairs et un niveau max** via la console navigateur. Et même avec un RLS strict, la logique de paiement/parrainage doit être serveur.

**Correctif :** déplacer `activatePremium`, le parrainage et l'attribution d'XP/énergie derrière des endpoints backend authentifiés (ou des Edge Functions Supabase avec la clé service).

### C2. Webhook Lemon Squeezy sans vérification de signature
`backend/src/studia/main.py` — `/api/webhook/lemon` :
```python
LEMON_WEBHOOK_SECRET = os.getenv("LEMON_WEBHOOK_SECRET")   # lu…
# …mais JAMAIS utilisé : pas de vérification de signature
if data.get("meta", {}).get("event_name") in ["order_created", "subscription_created"]:
    user_id = ...
    supabase.table('users').update({'is_premium': True, 'energy': 999})…
```
`hmac` et `hashlib` sont importés mais jamais utilisés. **N'importe qui peut POSTer sur cette route et passer n'importe quel `user_id` en premium.** Il faut vérifier l'en-tête `X-Signature` (HMAC-SHA256) avec `LEMON_WEBHOOK_SECRET` (doc Lemon Squeezy : `x-signature`).

### C3. Mot de passe admin par défaut codé en dur
`backend/src/studia/admin.py` :
```python
ADMIN_PASSWORD = os.getenv("ADMIN_SECRET", "studia123").strip()
```
Si `ADMIN_SECRET` n'est pas défini en production, le dashboard admin (`/api/analytics/dashboard`) est ouvert avec le mot de passe `studia123`, connu publiquement. En prime, le code **affiche le début du mot de passe dans les logs** à chaque démarrage (`print(f"➡️ Admin Password : {ADMIN_PASSWORD[:3]}***")`).

**Correctif :** supprimer le défaut (échouer au démarrage si absent), supprimer le print, et remplacer l'auth par en-tête + localStorage (voir M3) par une vraie session.

### C4. Endpoint push sans authentification
`backend/src/studia/notifications.py` — `/api/notifications/cron/daily-reminder` n'a **aucune** vérification d'identité : n'importe qui peut déclencher une notification push vers **tous les abonnés** (spam / harcèlement). Ironie : le frontend admin (`app/admin/page.tsx`, `triggerNotification`) appelle cet endpoint **sans** envoyer le header de mot de passe — preuve qu'il est conçu ouvert. Protéger par un token de cron (ex. `CRON_SECRET` en header) ou le mot de passe admin.

### C5. Clé Web3Forms committée en clair
`frontend/app/api/waitlist/route.ts` :
```js
access_key: '0a691a94-8de8-445c-82b1-a5accf0d48f7', // ⚠️ REMPLACE PAR TA VRAIE CLÉ
```
Soit c'est la vraie clé (fuite — les clés Web3Forms sont liées à un quota d'emails/mois), soit c'est un placeholder et le formulaire ne fonctionne pas. Passer en variable d'environnement (`WEB3FORMS_ACCESS_KEY`).

---

## 🟠 HAUTE priorité

### H1. Aucune protection des endpoints IA (coût OpenAI illimité)
Tous les endpoints `/api/quiz/*`, `/api/flashcards/*`, `/api/extract-text`, `/api/adaptive/*` sont **sans authentification, sans rate limiting, sans validation d'entrée** :
- `num_questions` non borné (on peut demander 10 000 questions en un appel) ;
- `course_text` non tronqué côté quiz (aucune limite de taille, contrairement à `learning_path.py` qui tronque à 20 000) ;
- `difficulty` non validée → `difficulty_instructions[difficulty]` lève `KeyError` → erreur 500.

Quiconque connaît l'URL du backend peut **brûler le quota OpenAI de l'application** (le coût s'applique aussi aux images base64 non limitées en taille sur `/api/extract-text`). Correctif : auth obligatoire (token Clerk vérifié côté serveur), rate limiting par utilisateur, bornes sur `num_questions` (≤ 20) et `course_text` (≤ 50 000 car.), validation par énumération.

### H2. CORS mal configuré
```python
allow_origins=["*"], allow_credentials=True
```
`allow_origins=["*"]` + `allow_credentials=True` est invalide côté navigateur (les requêtes avec credentials sont bloquées) et ouvre l'API à tous les sites. Restreindre à la liste explicite des domaines (ex. `https://studia.vercel.app`, `http://localhost:3000`).

### H3. `backend/node_modules` et `__pycache__` committés dans git
- **444 fichiers** de `backend/node_modules` sont suivis par git (dont 95 liés à `canvas` : binaires natifs ~50 Mo) ;
- 5 fichiers `.pyc` de `backend/src/studia/__pycache__/` sont committés — le motif `.gitignore` `backend/__pycache__/` ne matche **pas** les sous-dossiers (`backend/src/studia/__pycache__/`) ;
- `backend/package.json` + `package-lock.json` déclarent `canvas` alors que **rien dans le backend ne l'utilise** (il ne sert que dans `frontend/scripts/generate-icons.js`).

Correctif : `git rm -r backend/node_modules backend/src/**/__pycache__` + corriger le .gitignore (`__pycache__/`, `node_modules/` sans préfixe) + retirer `canvas` des dépendances runtime (le mettre en devDependencies du frontend uniquement).

### H4. Email personnel réel exposé dans le code
`frontend/hooks/useAnalytics.ts` :
```js
const EXCLUDED_EMAILS = [
    "ton_email@gmail.com",
    "admin@studia.com",
    "leolintello21@gmail.com" // Ajoute le tien ici
];
```
- Un email personnel est committé en clair (visible par tous les collaborateurs/cloneurs) ;
- L'exclusion des analytics est **côté client** : trivial à contourner, et elle fausse les stats (les admins n'apparaissent jamais dans le dashboard) — l'exclusion doit être serveur ou abandonnée.

### H5. Détection de triche / économie entièrement client-side (lié à C1)
Au-delà du premium : streaks, XP, niveaux, quiz history (`saveQuiz`), tous vérifiables/modifiables dans la console. Si la gamification a de la valeur (classements, récompenses), il faut un backend de confiance.

---

## 🟡 MOYENNE priorité

### M1. Six endpoints API renvoient toujours `{}` (fonctionnalités mortes)
`backend/src/studia/learning_path.py` se termine par des stubs explicites (*« Stubs pour éviter les erreurs d'import dans main.py »*) :
```python
def generate_diagnostic_quiz(t): return {}
def generate_remediation_content(t, w, d): return {}
def generate_validation_quiz(t, c, d): return {}
def generate_practice_exercise(t, d): return {}
def evaluate_student_answer(i, s, c): return {}
def generate_daily_plan(g, d, c): return {}
```
Or `main.py` expose ces fonctions via `/api/path/diagnostic`, `/api/path/remediation`, `/api/path/validation`, `/api/path/practice`, `/api/path/evaluate`, `/api/motivation/generate`. **Les composants front qui les appellent (diagnostic, motivation, remediation…) reçoivent un objet vide.** Soit implémenter ces fonctions, soit supprimer les endpoints et masquer les UI concernées. (`generate_step_content` est aussi un stub qui renvoie `{}`.)

### M2. Classe `PracticeRequest` définie deux fois dans `main.py`
La seconde définition (avec `weak_concepts`) écrase silencieusement la première (avec `difficulty`). L'endpoint `/api/path/practice` utilise donc un schéma différent de celui prévu. À fusionner et documenter.

### M3. Authentification admin artisanale
- Mot de passe envoyé dans un header custom `x-admin-password`, stocké en `localStorage` (`app/admin/page.tsx`) → volable par XSS, visible dans l'historique des requêtes ; à remplacer par une vraie session (cookie httpOnly, ou middleware Clerk avec rôle admin) ;
- La route `/admin` n'est **pas** protégée par le middleware Clerk (seul `/workspace(.*)` l'est) — le formulaire de login est public (acceptable, mais le code du dashboard est exposé).

### M4. Configuration multi-environnements fragile
- `backend/src/studia/settings.py` lit `API_PORT` (défaut 5000) mais **n'est importé nulle part** — code mort ; `main.py` écoute sur 8000 en local, le `Procfile` Heroku utilise `$PORT` ;
- `frontend/lib/api.ts` / `useAnalytics.ts` / `pricing` : défaut `NEXT_PUBLIC_API_URL = 'http://localhost:8000'` — en production sans variable d'env, **le navigateur appelle localhost** → tout casse. Et rien ne force la variable au build ;
- `next.config.ts` est vide : pas de `rewrites` pour `/api/*` vers le backend. Le front appelle le backend en direct depuis le navigateur (CORS + exposition de l'URL). Un proxy via `rewrites` résoudrait CORS et le problème localhost ;
- Incohérence : un route proxy existe (`app/api/proxy/track`) mais `useAnalytics` l'ignore et envoie en `sendBeacon` direct.

### M5. Robustesse backend
- `supabase` peut être `None` (clés absentes) : `admin.py` et `notifications.py` appellent `supabase.table(...)` sans garde → `AttributeError` ;
- `main.py` : chaque endpoint wrappe tout dans `try/except → HTTPException(500)` — on renvoie des détails d'erreur internes au client (`detail=str(e)`), fuite d'information ;
- `requirements.txt` sans épinglage de versions (reproductibilité) et sans nouvelle ligne finale (le fichier se termine par `pywebpush` collé à la ligne suivante).

### M6. Incohérences produit/monetisation
- `hooks/useQuizLimit.ts` : `canGenerateQuiz = true`, `remaining = Infinity`, `isPremium = false` — **mode gratuit illimité codé en dur**, alors que la page pricing annonce « 5 éclairs d'énergie par jour » et un plan Premium « bientôt ». Décider : soit la limite existe (backend), soit on assume le gratuit et on retire les écrans « premium ».

### M7. PWA / service worker
- `public/sw.js` pré-cache `/workspace/courses` — une route **protégée par Clerk** : le cache peut contenir du HTML non authentifié (page de redirection) servi hors-ligne. À retirer du pré-cache ou à vérifier le statut ;
- Pas de mise à jour auto du cache : `CACHE_NAME` doit être bumpé à chaque déploiement (process manuel fragile).

---

## 🟢 FAIBLE / Hygiène

| # | Problème | Fichiers |
|---|---|---|
| F1 | Fichiers morts committés : `toto.py` (test brouillon), `quiz.json`, `quiz_ses.md` (jamais référencés), `exercise_generator.py` (0 ligne) | `backend/src/…` |
| F2 | Artefacts de dev committés : `export-app.txt`, `export-lib-components.txt` | `frontend/` |
| F3 | Asset personnel/photo committé (3,7 Mo) : `IMG_1025.jpeg` + PDF d'archi — à déplacer hors git ou dans un storage | `backend/assets/`, `backend/docs/` |
| F4 | `canvas` en dépendance runtime du frontend (natif ~50 Mo) alors qu'il ne sert qu'au script `scripts/generate-icons.js` → le mettre en devDependencies | `frontend/package.json`, `backend/package.json` |
| F5 | Aucun test (0 fichier `test_*`, 0 `*.test.ts(x)`) et aucune CI (pas de `.github/workflows/`) | — |
| F6 | `runtime.txt` dit `python-3.11.8` mais les `.pyc` committés sont en 3.13 → dérive d'environnements locaux vs prod | `backend/` |
| F7 | README : mentionne « Supabase / Firebase » mais pas de Firebase ; nulle part la liste des variables d'env requises (`OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_SECRET`, `VAPID_*`, `LEMON_WEBHOOK_SECRET`, `NEXT_PUBLIC_*`, `WEB3FORMS_ACCESS_KEY`) | `README.md` |
| F8 | Google Analytics (`G-12WVTRWTWR`) en dur dans `layout.tsx` — à passer en var d'env (mineur) | `frontend/app/layout.tsx` |
| F9 | Scripts non documentés : `setup_xp.py`, `ia-context.py`, `fix-colors.js`, `prepare_code.py` | `frontend/scripts/`, racine |

---

## ✅ Ce qui est bien fait

- **Architecture backend claire** : modules spécialisés (quiz, flashcards, parcours, notifications, admin), docstrings françaises, imports propres.
- **Qualité des prompts IA** : `response_format={"type": "json_object"}`, instructions strictes, boucle *self-refining* (génération → validation → raffinement) dans `quiz_generator.py` et `flashcard_generator.py` — meilleure pratique.
- **PWA sérieuse** : service worker, manifest, icônes multi-tailles, IndexedDB pour l'offline (`pwaService.ts`).
- **Logique de streak correcte** (gestion du « hier » avec fuseaux), gestion d'erreurs front centralisée (`handleApiResponse`).
- **Séparation des secrets** : pas de clé OpenAI/Supabase en clair dans le code (hors C5 et C3), `.gitignore` racine correct pour `.env`.
- **Middleware Clerk** protégeant `/workspace` avec redirect propre vers `/sign-in`.

---

## 🛠 Plan d'action recommandé (par ordre d'impact)

1. **Sécuriser la monétisation** : endpoints serveur pour premium/énergie/XP/parrainage (ou Edge Functions Supabase + RLS strict). *(C1, H5)*
2. **Vérifier la signature du webhook Lemon** et supprimer le secret par défaut de l'admin. *(C2, C3)*
3. **Auth + rate limiting** sur les endpoints IA et le cron push. *(C4, H1)*
4. **Nettoyer le repo** : retirer `node_modules`, `__pycache__`, fichiers morts, corriger `.gitignore`. *(H3, F1–F3)*
5. **Remplacer les stubs** par de vraies implémentations ou retirer les endpoints/UI morts. *(M1)*
6. **Configurer un proxy API** (`next.config.ts` rewrites) + variables d'env documentées. *(M2, M4, F7)*
7. **Ajouter des tests** (pytest sur le backend, au minimum sur les générateurs) et une CI (GitHub Actions : lint + test + build). *(F5)*
