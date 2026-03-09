package main

import (
	"fmt"
	"os"
	"strconv"
	"github.com/rivo/tview"
)

func WriteEnv(data *Data) error {
    content := fmt.Sprintf(
`# Database
POSTGRES_USER=%s
POSTGRES_DB=%s

# Ports
NGINX_PORT_HTTP=%d
NGINX_PORT_HTTPS=%d`, 

	data.postgres_user, data.postgres_db, data.http_port, data.https_port)

    return os.WriteFile("/app/output/.env", []byte(content), 0644)
}

func SaveData(a *App, data *Data) {
	var tmp string
	form := a.prims[2].(*tview.Form)
	tmp  = form.GetFormItemByLabel("NGINX PORT HTTP").(*tview.InputField).GetText()
	data.http_port,_ = strconv.Atoi(tmp) 
	tmp  = form.GetFormItemByLabel("NGINX PORT HTTPS").(*tview.InputField).GetText()
	data.https_port,_ = strconv.Atoi(tmp) 
	data.postgres_user  = form.GetFormItemByLabel("POSTGRES_USER").(*tview.InputField).GetText()
	data.postgres_db  = form.GetFormItemByLabel("POSTGRES_DB").(*tview.InputField).GetText()
}
