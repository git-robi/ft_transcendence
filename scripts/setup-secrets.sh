#!/bin/sh
set -e

mkdir -p secrets

prompt_secret() {
  file="$1"
  label="$2"
  required="$3"
  exists="false"

  if [ -f "$file" ]; then
    exists="true"
  fi

  read_secret_value() {
    # Hide input only when running in an interactive terminal.
    if [ -t 0 ]; then
      stty -echo
      IFS= read -r value
      stty echo
      printf '\n'
    else
      IFS= read -r value
    fi
  }

  while true; do
    if [ "$exists" = "true" ]; then
      printf "%s already exists. Press Enter to keep it, or type a new value (hidden): " "$label"
      read_secret_value
      if [ -z "$value" ]; then
        echo "Keeping existing $label"
        return 0
      fi
    else
      if [ "$required" = "true" ]; then
        printf "Enter %s (hidden): " "$label"
      else
        printf "Enter %s (optional, hidden; leave blank to skip): " "$label"
      fi
      read_secret_value
    fi

    if [ "$required" = "true" ] && [ -z "$value" ]; then
      echo "$label is required and cannot be empty."
      continue
    fi

    printf '%s' "$value" > "$file"
    echo "Saved $label"
    return 0
  done
}

echo "Configuring secrets in ./secrets"

# Required secrets
prompt_secret "secrets/postgres_password" "Postgres password" "true"

# Optional OAuth secrets
prompt_secret "secrets/google_client_secret" "Google client secret" "false"
prompt_secret "secrets/github_client_secret" "GitHub client secret" "false"

echo "Vault tokens are managed by Vault and are not requested here."
echo "Secrets configuration complete."
