package main

import (
	"fmt"
	"os"
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
GOOGLE_CLIENT_ID=%s
GITHUB_CLIENT_ID=%s`, 

	data.postgres_user, 
	data.postgres_db, 
	data.http_port, 
	data.https_port,
	data.client_url,
	data.google_api_id,
	data.github_api_id)

    return os.WriteFile("/app/output/.env", []byte(content), 0644)
}

func WriteSecret(path, filename, content string) error {
	return os.WriteFile(path + "/" + filename, []byte(content), 0600)
}

/*func SaveData(a *App, data *Data) {
	data.https_port,_ = strconv.Atoi(tmp) 
	data.postgres_user  = form.GetFormItemByLabel("POSTGRES_USER").(*tview.InputField).GetText()
	data.postgres_db  = form.GetFormItemByLabel("POSTGRES_DB").(*tview.InputField).GetText()
}*/
