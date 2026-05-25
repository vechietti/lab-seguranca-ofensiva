# Laboratório Acadêmico de Segurança Ofensiva (SAST, SCA & Secrets)

Este repositório foi **intencionalmente projetado** para ser vulnerável. Ele serve como um alvo de testes acadêmicos para avaliar a eficácia de ferramentas de análise estática de segurança e detecção de segredos.

> [!WARNING]
> **ATENÇÃO:** Este código contém vulnerabilidades reais de alto impacto, chaves privadas hardcoded e configurações inseguras. **NUNCA publique ou implante este código em ambientes de produção.**

---

## 🛠️ Mapa de Vulnerabilidades do Laboratório

### 1. Dependências Inseguras (SCA) - Alvo para `OSV-Scanner` / `npm audit`
Arquivo: [package.json](package.json)
* **`lodash@4.17.15`**: Contém falhas graves de *Prototype Pollution* (CVE-2020-8203, CVE-2020-28500), que podem levar a negação de serviço ou execução remota de código (RCE).
* **`express@4.16.0`**: Versão desatualizada com múltiplas vulnerabilidades conhecidas (Open Redirect, Denial of Service).
* **`jsonwebtoken@8.5.1`**: Vulnerável a desvios de assinatura de chave pública e falsificação de tokens JWT (CVE-2022-23529).
* **`axios@0.19.0`**: Vulnerabilidade de Server-Side Request Forgery (SSRF) no tratamento de requisições externas (CVE-2020-28168).

### 2. Infraestrutura em Containers Insegura - Alvo para `Grype` / `Trivy`
Arquivo: [Dockerfile](Dockerfile)
* Utiliza a imagem base **`node:10.16.0-alpine`**.
* Esta imagem utiliza uma versão extremamente antiga do Alpine Linux que contém centenas de vulnerabilidades conhecidas de sistema operacional (em pacotes como `openssl`, `musl`, `busybox`, `zlib`), sendo o alvo perfeito para testar scanners de segurança de imagens Docker.

### 3. Vazamento de Credenciais e Segredos - Alvo para `Gitleaks` / `TruffleHog`
Arquivos: [config.js](config.js) e [.env](.env)
Este repositório expõe segredos fictícios projetados para corresponder às assinaturas de detecção padrão:
* **AWS Access Key ID**: Identificadores no padrão `AKIA...` (16 a 20 caracteres alfanuméricos em maiúsculo).
* **AWS Secret Access Key**: Padrão de string de 40 caracteres associada.
* **GitHub Personal Access Token (PAT)**: Token simulado no formato moderno `ghp_...` (36 caracteres alfanuméricos).
* **Strings de Conexão com Banco de Dados**: Credenciais expostas em formato de texto claro na URI do MongoDB (`config.js`) e PostgreSQL (`.env`).

### 4. Vulnerabilidades de Código-Fonte (SAST) - Alvo para `Semgrep` / `SonarQube`
Arquivo: [app.js](app.js)
* **Command Injection (Injeção de Comando)**: Uso inseguro da função `exec()` do Node.js na rota `/ping`, permitindo que caracteres especiais do shell (como `;`, `&&`, `|`) executem comandos arbitrários no servidor.
* **Eval Injection (Injeção de Código)**: Rota `/calculate` que utiliza o método perigoso `eval()` do JavaScript para executar dinamicamente strings enviadas pelo usuário.
* **SSRF (Server-Side Request Forgery)**: Rota `/fetch-url` que faz requisições usando `axios` diretamente a URLs fornecidas via query parameters, abrindo portas para port-scanning interno na rede privada do servidor.
* **Desativação Global do TLS**: Configuração global `process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'` que desabilita a validação de certificados digitais HTTPS da aplicação, facilitando ataques de Man-in-the-Middle (MitM).
* **JWT Vulnerável**: Assinatura e verificação de tokens JWT utilizando chaves fracas hardcoded (`secret123`), permitindo brute-force offline simplificado de chaves de assinatura.

---

## 🚀 Como Executar os Scanners de Segurança

Aqui estão os comandos para validar este laboratório usando ferramentas populares de código aberto:

### A. Detectando Segredos com o `Gitleaks`
Para varrer todo o histórico Git do repositório procurando por chaves vazadas:
```bash
# Rodar varredura local detectando chaves ativas ou no histórico de commits
gitleaks detect --source=. --verbose
```

### B. Analisando Dependências com o `OSV-Scanner`
Desenvolvido pelo Google, o OSV-Scanner verifica vulnerabilidades conhecidas em dependências:
```bash
# Executar na raiz do projeto contendo o package.json
osv-scanner --lockfile=package-lock.json # (ou apenas rodar osv-scanner ./)
```
*Dica:* Alternativamente, você pode rodar um simples `npm audit`.

### C. Varrendo Imagens de Container com o `Grype`
Para varrer a imagem Docker e detectar pacotes de SO desatualizados:
```bash
# 1. Construa a imagem localmente
docker build -t lab-seguranca-ofensiva:latest .

# 2. Execute a varredura da imagem usando o Grype
grype lab-seguranca-ofensiva:latest
```

### D. Análise Estática de Código (SAST) com o `Semgrep`
O Semgrep é uma excelente ferramenta SAST rápida e extensível:
```bash
# Rodar regras padrões de segurança de JavaScript/Node.js do Semgrep
semgrep --config auto
```

---

## 🎓 Uso Acadêmico
Este repositório foi construído especificamente para fins pedagógicos. sinta-se à vontade para clonar, executar scanners locais, construir pipelines de CI/CD (GitHub Actions) com estes testes integrados e analisar os relatórios gerados por cada ferramenta para entender como a detecção de vulnerabilidades funciona em profundidade.
