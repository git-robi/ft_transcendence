# 🔑 How to Get API Keys - Step by Step Guide

## 📋 Overview

This guide explains **where to get API keys** for each OAuth provider and **who should do it**.

---

## 🎯 Who Should Get the API Keys?

### Option 1: You (Developer)
- ✅ **If**: You have access to the provider accounts (42, Google, GitHub)
- ✅ **If**: You're setting up the development environment
- ✅ **If**: The project is in early stages

### Option 2: Project Lead / DevOps
- ✅ **If**: Keys need to be shared across the team
- ✅ **If**: Production keys are needed (should be separate from dev)
- ✅ **If**: Security/compliance requires centralized management

### Option 3: Client / Product Owner
- ✅ **If**: They own the accounts (e.g., company Google account)
- ✅ **If**: They need to approve OAuth app creation

**Recommendation**: For **development**, you can create your own keys. For **production**, coordinate with your team lead.

---

## 🔐 Getting 42 API Keys (Intra.42.fr)

### What You Need
- ✅ A **42 account** (student/staff account)
- ✅ Access to the **42 API portal**

### Step-by-Step

1. **Go to the 42 API Portal**
   - URL: https://api.intra.42.fr/oauth/applications
   - Login with your 42 credentials

2. **Create a New Application**
   - Click **"New application"** or **"Create a new application"**
   - Fill in the form:

   **Application Name**:
   ```
   ft_transcendence (or your project name)
   ```

   **Redirect URI** (IMPORTANT - must match exactly):
   ```
   Development: https://localhost/api/v1/auth/oauth/42/callback
   Production: https://yourdomain.com/api/v1/auth/oauth/42/callback
   ```

   **Scopes** (select what you need):
   - `public` - Basic profile information
   - `profile` - Extended profile information
   - `email` - Email address (if needed)

3. **Submit and Get Credentials**
   - Click **"Create"** or **"Submit"**
   - You'll see:
     - **UID** (Client ID) - This is your `client_id`
     - **Secret** (Client Secret) - This is your `client_secret`
   - ⚠️ **Copy these immediately** - The secret is only shown once!

4. **Store in Vault**
   ```bash
   docker compose exec vault vault kv put transcendence/oauth/42 \
       client_id="YOUR_UID_HERE" \
       client_secret="YOUR_SECRET_HERE" \
       redirect_uri="https://localhost/api/v1/auth/oauth/42/callback"
   ```

### Important Notes
- ⚠️ **Redirect URI must match exactly** (including `https://`, no trailing slash)
- ⚠️ **Secret is shown only once** - save it immediately
- ⚠️ **You can create multiple applications** (one for dev, one for prod)
- ✅ **Free** - No cost for 42 API access

### Troubleshooting
- **Can't access portal?**: Make sure you're logged into 42's website
- **Redirect URI error?**: Check the exact URL in your backend code
- **Secret lost?**: Create a new application or regenerate (if available)

---

## 🔐 Getting Google OAuth Keys

### What You Need
- ✅ A **Google account** (Gmail, Google Workspace, etc.)
- ✅ Access to **Google Cloud Console**

### Step-by-Step

1. **Go to Google Cloud Console**
   - URL: https://console.cloud.google.com/
   - Login with your Google account

2. **Create a New Project** (if you don't have one)
   - Click **"Select a project"** → **"New Project"**
   - Name: `ft_transcendence` (or your project name)
   - Click **"Create"**

3. **Enable Google+ API** (if needed)
   - Go to **"APIs & Services"** → **"Library"**
   - Search for **"Google+ API"** or **"People API"**
   - Click **"Enable"**

4. **Create OAuth Credentials**
   - Go to **"APIs & Services"** → **"Credentials"**
   - Click **"Create Credentials"** → **"OAuth client ID"**
   
   **If prompted to configure OAuth consent screen**:
   - **User Type**: External (for development) or Internal (for Google Workspace)
   - **App name**: `ft_transcendence`
   - **User support email**: Your email
   - **Developer contact**: Your email
   - Click **"Save and Continue"**
   - **Scopes**: Add `userinfo.email` and `userinfo.profile`
   - **Test users**: Add your email (for development)
   - Click **"Save and Continue"**

5. **Configure OAuth Client**
   - **Application type**: Select **"Web application"**
   - **Name**: `ft_transcendence` (or descriptive name)
   - **Authorized JavaScript origins**:
     ```
     Development: https://localhost
     Production: https://yourdomain.com
     ```
   - **Authorized redirect URIs**:
     ```
     Development: https://localhost/api/v1/auth/google/redirect
     Production: https://yourdomain.com/api/v1/auth/google/redirect
     ```
   - Click **"Create"**

6. **Get Your Credentials**
   - A popup will show:
     - **Client ID** - Copy this
     - **Client Secret** - Copy this
   - ⚠️ **Save these immediately** - You can view them later in Credentials

7. **Store in Environment Variables or Vault**

   **Option A: Environment Variables** (current setup):
   ```bash
   # In your .env file or docker-compose.yml
   GOOGLE_ID_CLIENT=your-client-id-here
   GOOGLE_CLIENT_SECRET=your-client-secret-here
   ```

   **Option B: Vault** (if migrated):
   ```bash
   docker compose exec vault vault kv put transcendence/oauth/google \
       client_id="YOUR_CLIENT_ID" \
       client_secret="YOUR_CLIENT_SECRET" \
       redirect_uri="https://localhost/api/v1/auth/google/redirect"
   ```

### Important Notes
- ⚠️ **OAuth consent screen** must be configured before creating credentials
- ⚠️ **Redirect URIs must match exactly** (protocol, domain, path)
- ⚠️ **For production**: You may need to verify your domain
- ✅ **Free tier**: Usually sufficient for development

### Troubleshooting
- **"OAuth client not created"**: Complete OAuth consent screen first
- **Redirect URI mismatch**: Check exact URL in your backend
- **"Access blocked"**: Add test users in OAuth consent screen (dev mode)

---

## 🔐 Getting GitHub OAuth Keys

### What You Need
- ✅ A **GitHub account** (free account works)
- ✅ Access to **GitHub Developer Settings**

### Step-by-Step

1. **Go to GitHub Developer Settings**
   - URL: https://github.com/settings/developers
   - Or: GitHub → Your Profile → Settings → Developer settings → OAuth Apps

2. **Create New OAuth App**
   - Click **"New OAuth App"** or **"Register a new application"**

3. **Fill in Application Details**
   - **Application name**: `ft_transcendence` (or your project name)
   - **Homepage URL**:
     ```
     Development: https://localhost
     Production: https://yourdomain.com
     ```
   - **Authorization callback URL** (IMPORTANT):
     ```
     Development: https://localhost/api/v1/auth/github/redirect
     Production: https://yourdomain.com/api/v1/auth/github/redirect
     ```
   - Click **"Register application"**

4. **Get Your Credentials**
   - You'll see:
     - **Client ID** - Copy this (public, can be shared)
     - **Client Secret** - Click **"Generate a new client secret"**
   - ⚠️ **Save the secret immediately** - It's shown only once!

5. **Store in Environment Variables or Vault**

   **Option A: Environment Variables** (current setup):
   ```bash
   # In your .env file or docker-compose.yml
   GITHUB_ID_CLIENT=your-client-id-here
   GITHUB_CLIENT_SECRET=your-client-secret-here
   ```

   **Option B: Vault** (if migrated):
   ```bash
   docker compose exec vault vault kv put transcendence/oauth/github \
       client_id="YOUR_CLIENT_ID" \
       client_secret="YOUR_CLIENT_SECRET" \
       redirect_uri="https://localhost/api/v1/auth/github/redirect"
   ```

### Important Notes
- ⚠️ **Client Secret can be regenerated** if lost
- ⚠️ **Redirect URI must match exactly**
- ✅ **Free** - No cost for GitHub OAuth
- ✅ **Unlimited apps** - You can create multiple OAuth apps

### Troubleshooting
- **Secret lost?**: Regenerate in GitHub settings
- **Redirect URI error?**: Check exact URL in your backend code
- **Access denied?**: Check OAuth app is active in GitHub settings

---

## 📊 Summary: Who Does What?

### For Development (You Can Do This)

| Provider | Who Can Create | Requirements | Time |
|----------|----------------|--------------|------|
| **42 API** | You (if you have 42 account) | 42 account | 5 min |
| **Google** | You (if you have Google account) | Google account | 10 min |
| **GitHub** | You (if you have GitHub account) | GitHub account | 5 min |

### For Production (Coordinate with Team)

| Provider | Who Should Create | Why |
|----------|-------------------|-----|
| **42 API** | Team lead / DevOps | May need organization account |
| **Google** | Company admin | May need Google Workspace account |
| **GitHub** | Team lead | May need organization account |

---

## 🚀 Quick Start Checklist

### Development Setup

- [ ] **42 API**: Create app at https://api.intra.42.fr/oauth/applications
  - [ ] Copy Client ID and Secret
  - [ ] Update Vault: `vault kv put transcendence/oauth/42 ...`
  - [ ] Restart backend

- [ ] **Google OAuth**: Create credentials at https://console.cloud.google.com/
  - [ ] Configure OAuth consent screen
  - [ ] Create OAuth client ID
  - [ ] Copy Client ID and Secret
  - [ ] Add to `.env` or Vault

- [ ] **GitHub OAuth**: Create app at https://github.com/settings/developers
  - [ ] Register new OAuth app
  - [ ] Copy Client ID and Secret
  - [ ] Add to `.env` or Vault

### Production Setup

- [ ] **Coordinate with team** on who creates production keys
- [ ] **Use different keys** for production (separate from dev)
- [ ] **Update redirect URIs** to production domain
- [ ] **Store securely** (Vault recommended for production)
- [ ] **Document** who has access to production keys

---

## 💡 Tips

### Development Keys
- ✅ **Use your personal accounts** - Fine for development
- ✅ **Create separate apps** for each environment
- ✅ **Test with your own account** first

### Production Keys
- ✅ **Use organization accounts** if available
- ✅ **Limit access** - Only necessary people
- ✅ **Document ownership** - Who created, who has access
- ✅ **Rotate regularly** - Change keys periodically

### Security
- ⚠️ **Never commit keys to Git** - Use Vault or `.env` (gitignored)
- ⚠️ **Use different keys** for dev/prod
- ⚠️ **Rotate if compromised** - Regenerate immediately
- ⚠️ **Limit scopes** - Only request permissions you need

---

## 📞 Need Help?

### 42 API Issues
- **Documentation**: https://api.intra.42.fr/apidoc
- **Support**: Contact 42 staff or check 42 Slack/Discord

### Google OAuth Issues
- **Documentation**: https://developers.google.com/identity/protocols/oauth2
- **Support**: Google Cloud Support (if you have support plan)

### GitHub OAuth Issues
- **Documentation**: https://docs.github.com/en/apps/oauth-apps
- **Support**: GitHub Support (usually responsive)

---

## 🎯 Quick Answer

**"¿De dónde saco las API keys?"**

1. **42 API**: https://api.intra.42.fr/oauth/applications (necesitas cuenta de 42)
2. **Google**: https://console.cloud.google.com/ (necesitas cuenta de Google)
3. **GitHub**: https://github.com/settings/developers (necesitas cuenta de GitHub)

**"¿Lo tendría que hacer la persona que se encarga de eso?"**

- **Para desarrollo**: Tú puedes hacerlo si tienes acceso a las cuentas
- **Para producción**: Coordina con tu equipo lead/DevOps (pueden necesitar cuentas de organización)

**Recomendación**: Empieza creando las keys de desarrollo tú mismo. Si necesitas keys de producción, coordina con tu equipo.
