package main

import (
	"fmt"
	"net/http"
	"github.com/gin-gonic/gin"
)

func main() {
	// Log de inicializacao demonstrando uso das chaves do config.go
	fmt.Printf("[INFO] Inicializando modulo GO com chave AWS: %s\n", AWSAccessKeyID)
	fmt.Printf("[INFO] String de Conexao de Banco: %s\n", DbConnection)

	// Usando o Gin framework desatualizado
	r := gin.Default()

	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Modulo GO do Laboratorio Academico de Segurança Ofensiva",
			"status":  "online",
			"packages": gin.H{
				"github.com/gin-gonic/gin": "v1.6.0",
				"golang.org/x/crypto":      "v0.0.0-20200622213623-75b288015ac9",
			},
			"scanners": []string{"OSV-Scanner", "Grype", "Gitleaks"},
		})
	})

	r.Run(Port)
}
