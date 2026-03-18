package main

import (
	"fmt"
	"os"
	"strconv"
)

func WriteEnv(data *Data) error {
    content := fmt.Sprintf(
`# Database
POSTGRES_USER=%s
POSTGRES_DB=%s

# Ports
NGINX_PORT_HTTP=%d
NGINX_PORT_HTTPS=%d
CLIENT_URL=%s

# OAuth Client IDs
GITHUB_ID_CLIENT=%s`,

	data.postgres_user,
	data.postgres_db,
	data.http_port,
	data.https_port,
	"https://" + data.nginx_domain + ":" + strconv.Itoa(data.https_port),
	data.github_api_id)

    return os.WriteFile("/app/output/.env", []byte(content), 0644)
}

func WriteSecret(path, filename, content string) error {
	return os.WriteFile(path + "/" + filename, []byte(content), 0600)
}
