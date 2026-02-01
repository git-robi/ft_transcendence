# 🔑 API Keys Management with Vault

## 📋 Current Situation

### What's Already in Vault

✅ **42 API OAuth Secrets** - Prepared in Vault (but with placeholder values)
- **Location**: `transcendence/oauth/42`
- **Secrets**: `client_id`, `client_secret`, `redirect_uri`
- **Status**: ⚠️ Currently using placeholder values (`your-42-client-id`, `your-42-client-secret`)

### What's NOT in Vault (Yet)

❌ **Google OAuth** - Using environment variables directly
- **File**: `server/src/passport-config.ts` (lines 12-13)
- **Variables**: `GOOGLE_ID_CLIENT`, `GOOGLE_CLIENT_SECRET`
- **Status**: Currently reading from `process.env`

❌ **GitHub OAuth** - Using environment variables directly
- **File**: `server/src/passport-config.ts` (lines 44-45)
- **Variables**: `GITHUB_ID_CLIENT`, `GITHUB_CLIENT_SECRET`
- **Status**: Currently reading from `process.env`

---

## 🎯 What You Need to Do

### 1. Configure 42 API Keys in Vault

**Current Status**: The 42 API keys are stored in Vault but with placeholder values.

**Steps to Configure Real Values**:

#### Option A: Update via Vault CLI (Recommended)

```bash
# 1. Get your real 42 API credentials from the 42 API portal
#    - Go to: https://api.intra.42.fr/oauth/applications
#    - Create a new application or use existing one
#    - Copy Client ID and Client Secret

# 2. Update Vault with real values
docker compose exec vault vault kv put transcendence/oauth/42 \
    client_id="YOUR_REAL_42_CLIENT_ID" \
    client_secret="YOUR_REAL_42_CLIENT_SECRET" \
    redirect_uri="https://localhost/api/v1/auth/oauth/42/callback"

# 3. Verify the update
docker compose exec vault vault kv get transcendence/oauth/42
```

#### Option B: Update via init-vault.sh Script

**File**: `vault/init-vault.sh` (lines 45-48)

Edit the script and replace placeholder values:

```bash
# Before:
vault kv put transcendence/oauth/42 \
    client_id="your-42-client-id" \
    client_secret="your-42-client-secret" \
    redirect_uri="https://localhost/api/v1/auth/oauth/42/callback"

# After (with real values):
vault kv put transcendence/oauth/42 \
    client_id="abc123def456ghi789" \
    client_secret="secret123456789abcdef" \
    redirect_uri="https://localhost/api/v1/auth/oauth/42/callback"
```

Then re-run initialization:
```bash
docker compose exec vault sh /vault/init-vault.sh
```

**⚠️ Important**: Don't commit real API keys to Git! Use environment variables or update Vault directly.

---

### 2. (Optional) Migrate Google/GitHub to Vault

**Current**: Google and GitHub OAuth use environment variables directly.

**Why Migrate?**:
- ✅ Consistency: All secrets in one place
- ✅ Security: Centralized secret management
- ✅ Audit: Track who accesses secrets
- ✅ Rotation: Easier to rotate secrets

**Steps to Migrate**:

#### Step 1: Add Google/GitHub Secrets to Vault

```bash
# Add Google OAuth secrets
docker compose exec vault vault kv put transcendence/oauth/google \
    client_id="YOUR_GOOGLE_CLIENT_ID" \
    client_secret="YOUR_GOOGLE_CLIENT_SECRET" \
    redirect_uri="https://localhost/api/v1/auth/google/redirect"

# Add GitHub OAuth secrets
docker compose exec vault vault kv put transcendence/oauth/github \
    client_id="YOUR_GITHUB_CLIENT_ID" \
    client_secret="YOUR_GITHUB_CLIENT_SECRET" \
    redirect_uri="https://localhost/api/v1/auth/github/redirect"
```

#### Step 2: Update Vault Client Interface

**File**: `server/src/config/vault.ts`

Add Google and GitHub to the interface:

```typescript
interface VaultSecrets {
    // ... existing code ...
    oauth?: {
        '42'?: {
            client_id: string;
            client_secret: string;
            redirect_uri: string;
        };
        'google'?: {  // ADD THIS
            client_id: string;
            client_secret: string;
            redirect_uri: string;
        };
        'github'?: {  // ADD THIS
            client_id: string;
            client_secret: string;
            redirect_uri: string;
        };
    };
}
```

#### Step 3: Update initialize() Method

**File**: `server/src/config/vault.ts` (around line 52)

Add Google and GitHub secret loading:

```typescript
// Load secrets from Vault
const [jwtSecret, dbSecret, oauth42Secret, oauthGoogleSecret, oauthGithubSecret] = await Promise.all([
    this.client.read('transcendence/data/jwt').catch(() => null),
    this.client.read('transcendence/data/database').catch(() => null),
    this.client.read('transcendence/data/oauth/42').catch(() => null),
    this.client.read('transcendence/data/oauth/google').catch(() => null),  // ADD
    this.client.read('transcendence/data/oauth/github').catch(() => null),  // ADD
]);
```

Then add to secrets object (around line 71):

```typescript
if (oauthGoogleSecret?.data?.data) {
    this.secrets.oauth = {
        ...this.secrets.oauth,
        google: {
            client_id: oauthGoogleSecret.data.data.client_id || '',
            client_secret: oauthGoogleSecret.data.data.client_secret || '',
            redirect_uri: oauthGoogleSecret.data.data.redirect_uri || '',
        },
    };
}

if (oauthGithubSecret?.data?.data) {
    this.secrets.oauth = {
        ...this.secrets.oauth,
        github: {
            client_id: oauthGithubSecret.data.data.client_id || '',
            client_secret: oauthGithubSecret.data.data.client_secret || '',
            redirect_uri: oauthGithubSecret.data.data.redirect_uri || '',
        },
    };
}
```

#### Step 4: Update getOAuthConfig() Method

**File**: `server/src/config/vault.ts` (line 137)

```typescript
getOAuthConfig(provider: '42' | 'google' | 'github') {  // UPDATE SIGNATURE
    if (!this.initialized) {
        throw new Error('Vault is not initialized. Call initialize() first.');
    }
    return this.secrets!.oauth?.[provider];
}
```

#### Step 5: Update passport-config.ts

**File**: `server/src/passport-config.ts`

Replace environment variables with Vault:

```typescript
import vaultClient from './config/vault';

// Google OAuth Strategy
passport.use(
    new GoogleStrategy({
        clientID: vaultClient.getOAuthConfig('google')?.client_id || process.env.GOOGLE_ID_CLIENT!,
        clientSecret: vaultClient.getOAuthConfig('google')?.client_secret || process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: vaultClient.getOAuthConfig('google')?.redirect_uri || 'http://localhost:3001/api/v1/auth/google/redirect'
    }, async (accessToken, refreshToken, profile, done) => {
        // ... existing code ...
    })
);

// GitHub OAuth Strategy
passport.use(
    new GithubStrategy({
        clientID: vaultClient.getOAuthConfig('github')?.client_id || process.env.GITHUB_ID_CLIENT!,
        clientSecret: vaultClient.getOAuthConfig('github')?.client_secret || process.env.GITHUB_CLIENT_SECRET!,
        callbackURL: vaultClient.getOAuthConfig('github')?.redirect_uri || 'http://localhost:3001/api/v1/auth/github/redirect'
    }, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        // ... existing code ...
    })
);
```

**Note**: The `|| process.env.XXX` provides fallback for development if Vault is unavailable.

---

## 📝 Quick Reference: Managing API Keys in Vault

### View Current API Keys

```bash
# View 42 API keys
docker compose exec vault vault kv get transcendence/oauth/42

# View all OAuth secrets
docker compose exec vault vault kv list transcendence/data/oauth/
```

### Update API Keys

```bash
# Update 42 API keys
docker compose exec vault vault kv put transcendence/oauth/42 \
    client_id="NEW_CLIENT_ID" \
    client_secret="NEW_CLIENT_SECRET" \
    redirect_uri="https://localhost/api/v1/auth/oauth/42/callback"

# After updating, restart backend to reload secrets
docker compose restart backend
```

### Delete API Keys (if needed)

```bash
# Delete OAuth secrets (not recommended, but possible)
docker compose exec vault vault kv delete transcendence/oauth/42
```

---

## 🔄 Secret Rotation

### How to Rotate API Keys

1. **Get new API keys** from the provider (42, Google, GitHub)
2. **Update in Vault**:
   ```bash
   docker compose exec vault vault kv put transcendence/oauth/42 \
       client_id="NEW_ID" \
       client_secret="NEW_SECRET" \
       redirect_uri="https://localhost/api/v1/auth/oauth/42/callback"
   ```
3. **Reload secrets in backend**:
   ```bash
   # Option 1: Restart backend (reloads all secrets)
   docker compose restart backend
   
   # Option 2: Use refresh() method (if implemented)
   # This would require adding an endpoint to trigger refresh
   ```

---

## ⚠️ Important Notes

### Development vs Production

**Development**:
- ✅ Can use placeholder values for testing
- ✅ Fallback to environment variables if Vault unavailable
- ⚠️ Self-signed certificates (browsers will warn)

**Production**:
- ❌ **MUST** use real API keys
- ❌ **MUST** have Vault running (no fallback)
- ❌ **MUST** use valid SSL certificates
- ❌ **MUST** update redirect URIs to production domain

### Security Best Practices

1. **Never commit API keys to Git**
   - Use Vault for all secrets
   - Add `.env` to `.gitignore` (already done)
   - Don't hardcode secrets in code

2. **Use different keys for dev/prod**
   - Development: Test keys or placeholders
   - Production: Real production keys
   - Separate Vault instances if possible

3. **Rotate keys regularly**
   - Change API keys periodically
   - Update in Vault immediately
   - Test after rotation

4. **Monitor access**
   - Enable Vault audit logging in production
   - Review who accesses secrets
   - Alert on suspicious activity

---

## 🚀 Getting API Keys

### 42 API (Intra)

1. Go to: https://api.intra.42.fr/oauth/applications
2. Click "New application"
3. Fill in:
   - **Name**: Your app name
   - **Redirect URI**: `https://localhost/api/v1/auth/oauth/42/callback` (dev) or your production URL
   - **Scopes**: Select needed permissions
4. Copy **Client ID** and **Client Secret**
5. Store in Vault (see steps above)

### Google OAuth

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click "Create Credentials" → "OAuth client ID"
3. Configure:
   - **Application type**: Web application
   - **Name**: Your app name
   - **Authorized redirect URIs**: `https://localhost/api/v1/auth/google/redirect`
4. Copy **Client ID** and **Client Secret**
5. Store in Vault (if migrated) or environment variables

### GitHub OAuth

1. Go to: https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: Your app name
   - **Homepage URL**: Your app URL
   - **Authorization callback URL**: `https://localhost/api/v1/auth/github/redirect`
4. Copy **Client ID** and generate **Client Secret**
5. Store in Vault (if migrated) or environment variables

---

## 📊 Summary

### Current State

| Provider | Storage | Status | Action Needed |
|----------|---------|--------|---------------|
| **42 API** | Vault | ⚠️ Placeholder values | Update with real keys |
| **Google** | Env vars | ✅ Working | Optional: Migrate to Vault |
| **GitHub** | Env vars | ✅ Working | Optional: Migrate to Vault |

### Recommended Actions

1. **Immediate**: Update 42 API keys in Vault with real values
2. **Optional**: Migrate Google/GitHub to Vault for consistency
3. **Production**: Ensure all keys are configured before deployment

---

## 🔍 Troubleshooting

### API Keys Not Working?

1. **Check if keys are in Vault**:
   ```bash
   docker compose exec vault vault kv get transcendence/oauth/42
   ```

2. **Verify backend can read from Vault**:
   ```bash
   docker compose logs backend | grep -i vault
   ```

3. **Check redirect URI matches**:
   - Must match exactly (including protocol, domain, path)
   - Development: `https://localhost/api/v1/auth/oauth/42/callback`
   - Production: Your production domain

4. **Restart backend after updating Vault**:
   ```bash
   docker compose restart backend
   ```

### Vault Connection Issues?

- Check Vault is running: `docker compose ps vault`
- Check Vault logs: `docker compose logs vault`
- Verify token: Check `VAULT_TOKEN` in `docker-compose.yml`

---

## 📚 Related Documentation

- `learning/VAULT-SECRETS-EXPLANATION.md`: How Vault works with secrets
- `SECURITY.md`: Complete security documentation
- `vault/init-vault.sh`: Initialization script
