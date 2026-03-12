package main
import (
	"fmt"
	"net"
)

func IsPortOpen(port int) error {
	ln, err := net.Listen("tcp", fmt.Sprintf(":%d", port))
	if err != nil {
		return err
	}
	ln.Close()
	return nil
}

func GetHostIP() (string, error) {
	addrs, err := net.InterfaceAddrs()
	if err != nil {
		return "", err
	}

	for _, addr := range addrs {
		if ip_host, ok := addr.(*net.IPNet); ok && !ip_host.IP.IsLoopback() {
			if ip_host.IP.To4() != nil {
				return ip_host.IP.String(), nil
			}
		}
	}
	return "", fmt.Errorf("no valid host IP address found")
}
