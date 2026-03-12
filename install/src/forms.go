package main

import (
	"github.com/rivo/tview"
	"strconv"
	"os"
)

func centerPrimitive(header *tview.TextView, form *tview.Form, width, height int) *tview.Flex {
	innerFlex := tview.NewFlex().
		SetDirection(tview.FlexRow).
		AddItem(header, 3, 1, false).
		AddItem(form, 0, 1, true)
	middleFlex := tview.NewFlex().
		AddItem(nil, 0, 1, false).
		AddItem(innerFlex, width, 1, true).
		AddItem(nil, 0, 1, false)
	return tview.NewFlex().
		SetDirection(tview.FlexRow).
		AddItem(nil, 0, 1, false).
		AddItem(middleFlex, height, 1, true).
		AddItem(nil, 0, 1, false)
}

func WelcomePage(a *App) *tview.Modal {
	return tview.NewModal().
		SetText("Installation process will begin.\nPlease press continue").
		AddButtons([]string{"continue", "quit"}).
		SetDoneFunc(func(buttonIndex int, buttonLabel string) {
			if buttonLabel == "quit" || buttonLabel == "" {
				a.app.Stop()
				os.Exit(1)
			} else {
				a.page.SwitchToPage("network")
			}
		})
}

func NetworkPage(a *App, data *Data) *tview.Flex {
	header := tview.NewTextView().
		SetText("Please select a port for the application.\nIt is recommended to select a port between 1024 and 49151").
		SetTextAlign(tview.AlignLeft)
	form := tview.NewForm()
	form.AddInputField("Port HTTP", strconv.Itoa(data.http_port), 20, IsDigit, nil)
	form.AddInputField("Port HTTPS", strconv.Itoa(data.https_port), 20, IsDigit, nil)
	form.AddButton("quit", func() { 
			a.app.Stop(); 
			os.Exit(1) 
		})
	form.AddButton("next", func() {
			data.http_port, _ = strconv.Atoi(form.GetFormItemByLabel("Port HTTP").(*tview.InputField).GetText())
			data.https_port, _ = strconv.Atoi(form.GetFormItemByLabel("Port HTTPS").(*tview.InputField).GetText())
			if err := IsPortOpen(data.http_port); err != nil {
				a.page.AddAndSwitchToPage("error", ShowErrorModal(a, 
				"Error port " + strconv.Itoa(data.http_port) + " is not available",
				"network"), false)
			} else if err := IsPortOpen(data.https_port); err != nil {
				a.page.AddAndSwitchToPage("error", ShowErrorModal(a, 
				"Error port " + strconv.Itoa(data.https_port) + " is not available",
				"network"), false)	
			} else {
				a.page.SwitchToPage("google")
			}
		})
	return centerPrimitive(header, form, 60, 10)
}

func GooglePage(a *App, data *Data) *tview.Flex {
	header := tview.NewTextView().
		SetText("Please copy paste Google API ID and Google API Key that are provided to you").
		SetTextAlign(tview.AlignLeft)
	form := tview.NewForm()
	form.AddInputField("Google API ID", data.google_api_id, 20, nil, nil)
	form.AddPasswordField("Google API Key", "", 30, '*', nil)
	form.AddButton("prev", func() {
			a.page.SwitchToPage("ports")
		})
	form.AddButton("next", func() {
			data.google_api_id = form.GetFormItemByLabel("Google API ID").(*tview.InputField).GetText()
			data.google_api_key = form.GetFormItemByLabel("Google API Key").(*tview.InputField).GetText()
			a.page.SwitchToPage("github")
		})
	return centerPrimitive(header, form, 60, 10)
}

func GithubPage(a *App, data *Data) *tview.Flex {
	header := tview.NewTextView().
		SetText("Please copy paste Github API ID and Github API Key that are provided to you").
		SetTextAlign(tview.AlignLeft)
	form := tview.NewForm()
	form.AddInputField("Github API ID", data.github_api_id, 20, nil, nil)
	form.AddPasswordField("Github API Key", "", 30, '*', nil)
	form.AddButton("prev", func() {
			a.page.SwitchToPage("google")
		})
	form.AddButton("next", func() {
			data.github_api_id = form.GetFormItemByLabel("Github API ID").(*tview.InputField).GetText()
			data.github_api_key = form.GetFormItemByLabel("Github API Key").(*tview.InputField).GetText()
			a.page.SwitchToPage("installation")
		})
	return centerPrimitive(header, form, 60, 10)
}

func InstallationPage(a *App, data *Data) *tview.Flex {
	header := tview.NewTextView().
	SetText("Installation: Click on Install to install the Pong Game\nThe app will be accessible from "	+ "https://" + data.nginx_domain + ":" + strconv.Itoa(data.https_port)).
		SetTextAlign(tview.AlignLeft)
	form := tview.NewForm()
	form.AddButton("quit", func() {
			a.app.Stop()
			os.Exit(1)
		})
	form.AddButton("install", func() {
			/*if err := env.Write("POSTGRES_USER",data.postgres_user, "test", false); err!= nil {
				panic(err)}*/
			GeneratePassword(SecretDir, "postgres_password")
			GeneratePassword(SecretDir, "vault_backend_token")
			GeneratePassword(SecretDir, "vault_root_token")
			WriteSecret(SecretDir, "google_client_secret", data.google_api_key)
			WriteSecret(SecretDir, "github_client_secret", data.github_api_key)
			WriteEnv(data)
			a.app.Stop()
			os.Exit(0)
		})
	return centerPrimitive(header, form, 60, 10)
}
	
func ShowErrorModal (a *App, message, returnPage string) *tview.Modal { 
	pop := tview.NewModal().
	SetText(message).
		AddButtons([]string {"OK"}).
		SetDoneFunc(func(buttonIndex int, buttonLabel string) {
			a.page.SwitchToPage(returnPage)
	})
	return pop
}
