package main

import (
	"strconv"
//	"fmt"
	"strings"
)

func	CheckInputs(data *Data) {
	

}

func 	isEmpty(str string) bool {
	return len(strings.TrimSpace(str)) == 0
}

func	IsDigit(str string, r rune) bool {
	return r >= '0' && r <= '9'
}

func	isNotDigit(str string) bool {
	_, err := strconv.Atoi(str)
	return err != nil
}

func 	isTooLong(str string, length int) bool {
	return len(str) > length
}

func	InvalidChar(str string, r rune) bool {
	var allowed string = "abcdefghijklmnopqrstuvwxyz-_1234567890" 
	if !strings.ContainsRune(allowed, r) {
		return false
	}
	return true
}

func 	ValidatePortInput(port string) {

}

func	CheckPortNum(port string) bool {
	var num int
	var err error
	num, err = strconv.Atoi(port)
	if (num < 0 || num > 65535 || err != nil) {
		return false
	}
	return true 
}


		//return fmt.Errorf("port %d is invalid: number must be between 0 and 65534, recommmanded range is 1024 - 49151", port)
