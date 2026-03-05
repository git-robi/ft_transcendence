package main

import (
	"strconv"
	"github.com/gofor-little/env"
)

func	WriteEnv(data *Data) {
	//how to return error
	env.Write("POSTGRES_USER", data.postgres_user, "db_user", false);	
	env.Write("POSTGRES_DB", data.postgres_db, "db_name", false);
	env.Write("NGINX_PORT_HTTP", strconv.Itoa(data.http_port), "http_port", false);
	env.Write("NGINX_PORT_HTTPS", strconv.Itoa(data.http_port), "https_port", false);
}
