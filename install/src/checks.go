package main

import (
	"strconv"
	"strings"
)

func	IsDigit(str string, r rune) bool {
	return r >= '0' && r <= '9'
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

func	CheckPortNum(port string) bool {
	var num int
	var err error
	if len(strings.TrimSpace(port)) == 0 {
		return false
	}
	num, err = strconv.Atoi(port)
	if (num < 0 || num > 65535 || err != nil) {
		return false
	}
	return true 
}


