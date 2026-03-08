package main

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"os"
)

func generateString(n int) (string, error) {
	bytes := make([]byte, n)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

func writeToFile(filename, content string) error {
	return os.WriteFile(filename, []byte(content), 0600)
}

func GeneratePassword(filename string) {
	randomHex, err := generateString(32)

	if err != nil {
		fmt.Println("Error generating random string:", err)
		return
	}

	// Write the random hex string to a file
	if err := writeToFile(filename, randomHex); err != nil {
		fmt.Println("Error writing to file:", err)
		return
	}
}

