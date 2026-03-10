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
	prims	[6]tview.Primitive
}

type Data struct {
	postgres_user		string
	postgres_db			string
	http_port			int
	https_port			int
	nginx_domain		string	
	client_url			string
	google_api_id		string
	google_api_key		string
	github_api_id		string
	github_api_key		string
}

const (
	OutputDir = "/app/output"
	SecretDir = "/app/output/secrets"
)

func dropPrivileges() {
	user, err := user.Lookup("appuser")
	if err != nil {
		log.Fatalf("Failed to lookup appuser: %v", err)
	}
	uid, err := strconv.Atoi(user.Uid)
	if err != nil {
		log.Fatalf("Failed to parse UID: %v", err)
	}
	gid, err := strconv.Atoi(user.Gid)
	if err != nil {
		log.Fatalf("Failed to parse GID: %v", err)
	}
	if err := syscall.Setgid(gid); err != nil {
		log.Fatalf("Failed to set GID: %v", err)
	}
	if err := syscall.Setuid(uid); err != nil {
		log.Fatalf("Failed to set UID: %v", err)
	}
}

func initData(a *App, data *Data) {
	a.prims[0] = WelcomePage(a)
	a.prims[1] = NetworkPage(a, data)
	a.prims[2] = GooglePage(a, data)
	a.prims[3] = GithubPage(a, data)
	a.prims[4] = InstallationPage(a, data)
}

func setupPages(a *App) {
	a.page.AddAndSwitchToPage("welcome", a.prims[0], false)
	a.page.AddPage("ports", a.prims[1], true, false)
	a.page.AddPage("google", a.prims[2], true, false)
	a.page.AddPage("github", a.prims[3], true, false)
	a.page.AddPage("installation", a.prims[4], true, false)
//	a.page.AddPage("error", a.prims[0], true, false)
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
		postgres_db: "tr_database",
	}
	if os.Getuid() == 0 {
        dropPrivileges()
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
