package main

import (
	"log"
	"os"
	"os/user"
	"strconv"
	"syscall"
	"github.com/rivo/tview"
	"github.com/gdamore/tcell/v2"
)

type App struct {
	app 	*tview.Application
	page 	*tview.Pages
	prims	[5]tview.Primitive
}

type Data struct {
	postgres_user		string
	postgres_db			string
	http_port			int
	https_port			int
	nginx_domain		string	
	github_api_id		string
	github_api_key		string
}

const (
	OutputDir = "/app/output"
	SecretDir = "/app/output/secrets"
	SSLDir = "/app/output/ssl"
)

func dropPrivileges() {
	user, err := user.Lookup("appuser")
	if err != nil {
		log.Printf("Warning: Failed to lookup appuser, skipping privilege drop: %v", err)
		return
	}
	uid, err := strconv.Atoi(user.Uid)
	if err != nil {
		log.Printf("Warning: Failed to parse UID, skipping privilege drop: %v", err)
		return
	}
	gid, err := strconv.Atoi(user.Gid)
	if err != nil {
		log.Printf("Warning: Failed to parse GID, skipping privilege drop: %v", err)
		return
	}
	if err := syscall.Setgid(gid); err != nil {
		log.Printf("Warning: Failed to set GID, continuing as current user: %v", err)
		return
	}
	if err := syscall.Setuid(uid); err != nil {
		log.Printf("Warning: Failed to set UID, continuing as current user: %v", err)
		return
	}
}

func initData(a *App, data *Data) {
	a.prims[0] = WelcomePage(a)
	a.prims[1] = NetworkPage(a, data)
	a.prims[2] = GithubPage(a, data)
	a.prims[3] = InstallationPage(a, data)
}

func setupPages(a *App) {
	a.page.AddAndSwitchToPage("welcome", a.prims[0], false)
	a.page.AddPage("network", a.prims[1], true, false)
	a.page.AddPage("github", a.prims[2], true, false)
	a.page.AddPage("installation", a.prims[3], true, false)
	a.page.AddPage("error", ShowErrorModal(a, "", ""), true, false)
}

func 	main() {
	window := &App {
		app:	tview.NewApplication(),
		page:	tview.NewPages(),
	}
	data := &Data {
		http_port: 3000,
		https_port: 3001,
		postgres_user: "db_user",
		postgres_db: "pong_db",
	}
	if lanIP := os.Getenv("HOST_LAN_IP"); lanIP != "" {
		data.nginx_domain = lanIP
	} else if ip_host, err := GetHostIP(); err == nil {
		data.nginx_domain = ip_host
	} else {
		data.nginx_domain = "localhost"
	}
	if (GenerateCerts(data.nginx_domain) != nil) {
		os.Exit(1)
	}
	initData(window, data)
	setupPages(window)
	handleSig := func (event *tcell.EventKey) *tcell.EventKey {
	    if event.Key() == tcell.KeyCtrlC {
			window.app.Stop()
        	os.Exit(1)
		}
		return event
    }
	window.app.SetInputCapture(handleSig)
	if err := window.app.
			SetRoot(window.page, true).
			EnableMouse(true).
			SetTitle("Pong Installer").
			SetFocus(window.page).Run(); err != nil {
		panic(err)
	}
}
