package main

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"os"
	"crypto/rsa"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/pem"
	"math/big"
	"time"
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

func GeneratePassword(path, filename string) {
	randomHex, err := generateString(32)

	if err != nil {
		fmt.Println("Error generating random string:", err)
		return
	}
	if err := writeToFile(path + "/" + filename, randomHex); err != nil {
		fmt.Println("Error writing to file:", err)
		return
	}
}

func GenerateCerts(nginx_domain string) error {
	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		return err
	}
	cert := &x509.Certificate{
		SerialNumber: big.NewInt(1658),
		Subject: pkix.Name{
			Organization: []string{"Pong Group"},
			CommonName:   nginx_domain,
		},
		NotBefore:             time.Now(),
		NotAfter:              time.Now().AddDate(1, 0, 0),
		IsCA:                  true,
		ExtKeyUsage:           []x509.ExtKeyUsage{x509.ExtKeyUsageClientAuth, x509.ExtKeyUsageServerAuth},
		KeyUsage:              x509.KeyUsageDigitalSignature | x509.KeyUsageCertSign,
		BasicConstraintsValid: true,
		DNSNames:              []string{nginx_domain},
	}
	certBytes, err := x509.CreateCertificate(rand.Reader, cert, cert, &privateKey.PublicKey, privateKey)
	if err != nil {
		return err
	}
	certPEM := pem.EncodeToMemory(&pem.Block{Type: "CERTIFICATE", Bytes: certBytes})
	keyPEM := pem.EncodeToMemory(&pem.Block{Type: "RSA PRIVATE KEY", Bytes: x509.MarshalPKCS1PrivateKey(privateKey)})
	if err := os.WriteFile(SSLDir + "/cert.pem", certPEM, 0644); err != nil {
		return err
	}
	if err := os.WriteFile(SSLDir + "/key.pem", keyPEM, 0600); err != nil {
		return err
	}
	return nil
}

