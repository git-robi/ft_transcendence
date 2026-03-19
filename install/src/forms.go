package main

import (
	"github.com/rivo/tview"
	"strconv"
	"os"
)

func centerPrimitive(header *tview.TextView, form *tview.Form, width, height int, lines int) *tview.Flex {
	innerFlex := tview.NewFlex().
		SetDirection(tview.FlexRow).
		AddItem(header, lines, 1, false).
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
		SetText("Installation process will begin.\nPlease press continue for standard installation. If required you can reconfigure ports to be used by the app.").
		AddButtons([]string{"continue", "reconfigure ports", "quit"}).
		SetDoneFunc(func(buttonIndex int, buttonLabel string) {
			if buttonLabel == "quit" || buttonLabel == "" {
				a.app.Stop()
				os.Exit(1)
			} else if buttonLabel == "continue"{
				a.page.SwitchToPage("github")
			} else {
				a.page.SwitchToPage("network")
			}
		})
}

func NetworkPage(a *App, data *Data) *tview.Flex {
	header := tview.NewTextView().
		SetText("We do not recommend to change values below, unless you know what you are doing").
		SetTextAlign(tview.AlignLeft).
		SetWordWrap(true)
	form := tview.NewForm()
	form.AddInputField("Port HTTP", strconv.Itoa(data.http_port), 20, IsDigit, nil)
	form.AddInputField("Port HTTPS", strconv.Itoa(data.https_port), 20, IsDigit, nil)
	form.AddButton("quit install", func() { 
			a.app.Stop(); 
			os.Exit(1) 
		})
	form.AddButton("configure Github", func() {
			http := form.GetFormItemByLabel("Port HTTP").(*tview.InputField).GetText()
			https := form.GetFormItemByLabel("Port HTTPS").(*tview.InputField).GetText()
			data.http_port, _ = strconv.Atoi(http)
			data.https_port, _ = strconv.Atoi(https)
			if CheckPortNum(http) == false || CheckPortNum(https) == false {
				a.page.AddAndSwitchToPage("error", ShowErrorModal(a, 
				"Error in port format",	"network"), false)
			} else if http == https {
				a.page.AddAndSwitchToPage("error", ShowErrorModal(a, 
				"Ports cannot be identical", "network"), false)
			} else if err := IsPortOpen(data.http_port); err != nil {
				a.page.AddAndSwitchToPage("error", ShowErrorModal(a, 
				"Error port " + strconv.Itoa(data.http_port) + " is not available",
				"network"), false)
			} else if err := IsPortOpen(data.https_port); err != nil {
				a.page.AddAndSwitchToPage("error", ShowErrorModal(a, 
				"Error port " + strconv.Itoa(data.https_port) + " is not available",
				"network"), false)	
			} else{
				a.page.SwitchToPage("github")
			}
		})
	return centerPrimitive(header, form, 60, 10, 3)
}

func GithubPage(a *App, data *Data) *tview.Flex {
	var str string = "Please copy past Github Client ID and Github Secret Key that are provided to you\n\n"
	str += "Note the following domain will be used for Github OAuth redirection: "
	str += data.nginx_domain
	str += "\nPlease ensure your Github OAuth is configured with this domain for the app"
	header := tview.NewTextView().
		SetText(str).
		SetTextAlign(tview.AlignLeft).
		SetWordWrap(true)
	form := tview.NewForm()
	form.AddInputField("Github Client ID", data.github_api_id, 40, nil, nil)
	form.AddPasswordField("Github Secret Key", "", 40, '*', nil)
	form.AddButton("prev", func() {
		a.page.SwitchToPage("welcome")
	})
	form.AddButton("next", func() {
			data.github_api_id = form.GetFormItemByLabel("Github Client ID").(*tview.InputField).GetText()
			data.github_api_key = form.GetFormItemByLabel("Github Secret Key").(*tview.InputField).GetText()
			a.page.SwitchToPage("installation")
		})
	form.SetFocus(0)
	return centerPrimitive(header, form, 100, 30, 5)
}

func InstallationPage(a *App, data *Data) *tview.Flex {
	header := tview.NewTextView().
	SetText("Installation: Click on Install to install the Pong Game").
		SetTextAlign(tview.AlignLeft).
		SetWordWrap(true)
	form := tview.NewForm()
	form.AddButton("quit", func() {
			a.app.Stop()
			os.Exit(1)
		})
	form.AddButton("install", func() {
			GeneratePassword(SecretDir, "postgres_password")
			GeneratePassword(SecretDir, "vault_backend_token")
			GeneratePassword(SecretDir, "vault_root_token")
			WriteSecret(SecretDir, "github_client_secret", data.github_api_key)
			WriteEnv(data)
			a.app.Stop()
			os.Exit(0)
		})
	form.SetFocus(1)
	return centerPrimitive(header, form, 60, 10, 3)
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
