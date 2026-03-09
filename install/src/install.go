package main

import (
	"log"
	"os"
	"os/user"
	"strconv"
	"syscall"
	"github.com/rivo/tview"
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

func		initData(a *App, data *Data) {
	//welcome page
	a.prims[1] = tview.NewModal().	
		SetText("Installation process will begin.\nPlease press continue").
		AddButtons([]string {"continue", "quit"}).
		SetDoneFunc(func(buttonIndex int, buttonLabel string) {
			if (buttonLabel == "quit" || buttonLabel == "") {
				a.app.Stop()
			} else {
				a.page.SwitchToPage("ports")
			}
		})
		//AddInputField("POSTGRES_USER", data.postgres_user, 20, InvalidChar, nil).
		//AddInputField("POSTGRES_DB", data.postgres_db, 5, InvalidChar, nil).
		//AddPasswordField("Github API Key", "", 30, '*', nil).
		//AddPasswordField("Google API Key", "", 30, '*', nil).
		

	//Database page
	a.prims[2] = tview.NewForm().
		AddTextView("Network configuration", "Please select a port for the application.\nIt is recommended to select a port between 1024 and 49151", 0, 0, false, true).
		AddInputField("Port HTTP", strconv.Itoa(data.http_port), 20, IsDigit, nil).
		AddInputField("Port HTTPS", strconv.Itoa(data.https_port), 20, IsDigit, nil).
		AddButton("quit", func() {
			a.app.Stop()
		}).
		AddButton("next", func() {
			var tmp string
			form := a.prims[2].(*tview.Form)
			tmp  = form.GetFormItemByLabel("Port HTTP").(*tview.InputField).GetText()
			data.http_port,_ = strconv.Atoi(tmp) 
			tmp  = form.GetFormItemByLabel("Port HTTPS").(*tview.InputField).GetText()
			data.https_port,_ = strconv.Atoi(tmp) 
			a.page.SwitchToPage("google")
		})
	
	//Google Page
	a.prims[3] = tview.NewForm().
		AddTextView("Google OAuth", "Please copy paste Google API ID and Google API Key that are provided to you", 0, 0, false, true).
		AddInputField("Google API ID", data.google_api_id, 20, nil, nil).
		AddPasswordField("Google API Key", "", 30, '*', nil).
		AddButton("prev", func() {
			a.page.SwitchToPage("ports")
		}).
		AddButton("next", func() {
			form := a.prims[3].(*tview.Form)
			data.google_api_id = form.GetFormItemByLabel("Google API ID").(*tview.InputField).GetText()
			data.google_api_key = form.GetFormItemByLabel("Google API Key").(*tview.InputField).GetText()
			a.page.SwitchToPage("github")
		})
	
	//Github Page
	a.prims[4] = tview.NewForm().
		AddTextView("Github OAuth", "Please copy paste Github API ID and Github API Key that are provided to you", 0, 0, false, true).
		AddInputField("Github API ID", data.github_api_id, 20, nil, nil).
		AddPasswordField("Github API Key", "", 30, '*', nil).
		AddButton("prev", func() {
			a.page.SwitchToPage("google")
		}).
		AddButton("next", func() {
			form := a.prims[4].(*tview.Form)
			data.github_api_id = form.GetFormItemByLabel("Github API ID").(*tview.InputField).GetText()
			data.github_api_key = form.GetFormItemByLabel("Github API Key").(*tview.InputField).GetText()
			a.page.SwitchToPage("installation")
		})
	
	//Installation Page
	a.prims[5] = tview.NewForm().
		AddTextView("Installation", "Click on Install to install the Pong Game", 0, 0, false, true).
		AddButton("quit", func() {
			a.app.Stop()
		}).
		AddButton("install", func() {
			/*if err := env.Write("POSTGRES_USER",data.postgres_user, "test", false); err!= nil {
				panic(err)}*/
			GeneratePassword(SecretDir, "postgres_password")
			GeneratePassword(SecretDir, "vault_backend_token")
			GeneratePassword(SecretDir, "vault_root_token")
			WriteSecret(SecretDir, "google_client_secret", data.google_api_key)
			WriteSecret(SecretDir, "github_client_secret", data.github_api_key)
			WriteEnv(data)
			a.app.Stop()
		})
	
	//Error pop-up
	a.prims[0] = tview.NewModal().
		SetText("Error!").
		AddButtons([]string {"OK"}).
		SetDoneFunc(func(buttonIndex int, buttonLabel string) {
				a.page.SwitchToPage("form")
			})
}

func main() {
	if os.Getuid() == 0 {
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
	
	window := &App {
		app:  tview.NewApplication(),
		page: tview.NewPages(),
	}
	data := &Data {
		http_port: 0,
		https_port: 0,
		postgres_user: "db_user",
		postgres_db: "tr_database",
	}

	initData(window, data)
	window.page.AddAndSwitchToPage("welcome", window.prims[1], false)
	window.page.AddPage("ports", window.prims[2], true, false)
	window.page.AddPage("google", window.prims[3], true, false)
	window.page.AddPage("github", window.prims[4], true, false)
	window.page.AddPage("installation", window.prims[5], true, false)
	window.page.AddPage("error", window.prims[0], true, false)
	if err := window.app.SetRoot(window.page, true).SetFocus(window.page).Run(); err != nil {
		panic(err)
	}
}
