package main

// Cuidado: Segredos expostos intencionalmente para fins de teste com Gitleaks
const (
	Port = ":8080"

	// Credenciais ficticias da AWS
	AWSAccessKeyID     = "AKIA3X4Y5Z6W7V8U9T0S"
	AWSSecretAccessKey = "eXaMpLeSeCrEtKeY/wJalrXUtnFEMI/K7MDENG/bPxR"

	// String de conexao do Banco de Dados em texto claro
	DbConnection = "postgres://go_db_user:PassGoSecure123!@go-db-server.internal:5432/production_go_db"
)
