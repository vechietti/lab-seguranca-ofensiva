from flask import Flask, jsonify
import requests
import jinja2
import cryptography
import config

app = Flask(__name__)

# Log de inicializacao demonstrando uso de chaves hardcoded
print(f"[INFO] Inicializando modulo Python com chave AWS: {config.AWS_ACCESS_KEY_ID}")
print(f"[INFO] URL de Conexao do Banco de Dados: {config.DATABASE_URL}")

@app.route('/')
def home():
    return jsonify({
        "message": "Modulo Python do Laboratorio Academico de Segurança Ofensiva",
        "status": "online",
        "packages": {
            "Flask": "0.12",
            "requests": "2.20.0",
            "Jinja2": "2.10",
            "cryptography": "2.3"
        },
        "scanners": ["OSV-Scanner", "Grype", "Gitleaks"]
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=config.PORT)
