package main

import (
	"github.com/rivo/tview"
)

type App struct {
	app 	*tview.Application
	page 	*tview.Pages
	prims	[3]tview.Primitive
}

type Data struct {
	http_port		int
	https_port		int
	postgres_user	string
	postgres_db		string
}

func		initData(a *App, data *Data) {
	//welcome page
	a.prims[1] = tview.NewModal().	
		SetText("Installation process will begin.\nPlease press continue").
		AddButtons([]string {"continue", "quit"}).
		SetDoneFunc(func(buttonIndex int, buttonLabel string) {
			if (buttonLabel == "quit" || buttonLabel == "") {
				a.app.Stop()
			} else {
				a.page.SwitchToPage("form")
			}
		})
	//Form page
	a.prims[2] = tview.NewForm().
		AddInputField("NGINX PORT HTTP", "3000", 20, IsDigit, nil).
		AddInputField("NGINX PORT HTTPS", "3001", 20, IsDigit, nil).
		AddInputField("POSTRGRES_USER", data.postgres_user, 20, InvalidChar, nil).
		AddInputField("POSTGRES_DB", data.postgres_db, 5, InvalidChar, nil).
		AddPasswordField("Github API Key", "", 30, '*', nil).
		AddPasswordField("Google API Key", "", 30, '*', nil).
		AddButton("quit", func() {
			a.app.Stop()
		}).
		AddButton("save", func() {
			a.page.ShowPage("error")
		}).
		AddButton("install", func() {
			/*if err := env.Write("POSTGRES_USER",data.postgres_user, "test", false); err!= nil {
				panic(err)}*/
			WriteEnv(data)
			a.app.Stop()
		})
	
/*AddInputField adds an input field to the form. It has a label, 
  an optional initial value, a field width (a value of 0 extends it as 
  far as possible), an optional accept function to validate the item's 
  value (set to nil to accept any text), and an (optional) callback 
  function which is invoked when the input field's text has changed.*/

	//Error pop-up
	a.prims[0] = tview.NewModal().
		SetText("Error!").
		AddButtons([]string {"OK"}).
		SetDoneFunc(func(buttonIndex int, buttonLabel string) {
				a.page.SwitchToPage("form")
			})
}

func main() {
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
	window.page.AddPage("form", window.prims[2], true, false)
	window.page.AddPage("error", window.prims[0], true, false)
	if err := window.app.SetRoot(window.page, true).SetFocus(window.page).Run(); err != nil {
		panic(err)
	}
}
