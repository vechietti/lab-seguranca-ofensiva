# Laboratório Acadêmico de Segurança Ofensiva & DevSecOps (Multi-Language)

Este repositório foi **intencionalmente projetado** para ser vulnerável. Ele serve como um alvo de testes acadêmicos multilíngue para avaliar a eficácia de ferramentas de análise estática de segurança, gerenciamento de dependências e detecção de segredos.

> [!WARNING]
> **ATENÇÃO:** Este código contém vulnerabilidades reais de alto impacto, chaves privadas hardcoded e configurações inseguras. **NUNCA publique ou implante este código em ambientes de produção.**

---

## 🛠️ Estrutura e Mapa de Vulnerabilidades do Laboratório

O repositório está organizado em três subdiretórios representando diferentes ecossistemas de desenvolvimento para testar o comportamento das ferramentas em múltiplos ambientes:

### 🟢 1. Módulo Node.js (`app-node/`)
* **Dependências Inseguras (SCA - [app-node/package.json](app-node/package.json)):**
  * **`lodash@4.17.15`**: Falha grave de *Prototype Pollution* (CVE-2020-8203, CVE-2020-28500).
  * **`express@4.16.0`**: Versão antiga vulnerável a Open Redirect e Denial of Service.
  * **`jsonwebtoken@8.5.1`**: Vulnerável a desvios de assinatura e falsificação de tokens JWT (CVE-2022-23529).
  * **`axios@0.19.0`**: Vulnerável a Server-Side Request Forgery (SSRF) (CVE-2020-28168).
* **Infraestrutura em Containers (Grype - [app-node/Dockerfile](app-node/Dockerfile)):**
  * Baseado em **`node:10.16.0-alpine`** contendo pacotes legados vulneráveis de SO (`openssl`, `musl`, `busybox`, `zlib`).
* **Vazamento de Segredos (Gitleaks - [app-node/config.js](app-node/config.js) / [app-node/.env](app-node/.env)):**
  * AWS Access Key ID no formato padrão (`AKIA...`), GitHub PAT fictício (`ghp_...`) e string de conexão do MongoDB exposta em texto claro.

### 🟡 2. Módulo Python (`app-python/`)
* **Dependências Inseguras (SCA - [app-python/requirements.txt](app-python/requirements.txt)):**
  * **`Flask==0.12`**: Versão antiga com falhas conhecidas de negação de serviço.
  * **`requests==2.20.0`**: Vulnerável a vazamento de credenciais em redirects (CVE-2018-18074).
  * **`Jinja2==2.10`**: Vulnerabilidade de Sandbox Escape (CVE-2019-10906).
  * **`cryptography==2.3`**: Vulnerável a falhas de estouro de pilha e corrupção de memória.
* **Infraestrutura em Containers (Grype - [app-python/Dockerfile](app-python/Dockerfile)):**
  * Baseado em **`python:3.6-slim`** com dezenas de vulnerabilidades do Debian Stretch (Glibc, OpenSSL).
* **Vazamento de Segredos (Gitleaks - [app-python/config.py](app-python/config.py) / [app-python/.env](app-python/.env)):**
  * Chave AWS fictícia, Token de Webhook do Slack (`hooks.slack.com`) e credenciais expostas do PostgreSQL.

### 🔵 3. Módulo Go (`app-go/`)
* **Dependências Inseguras (SCA - [app-go/go.mod](app-go/go.mod)):**
  * **`github.com/gin-gonic/gin v1.6.0`**: Vulnerável a validações incorretas e problemas de CORS (CVE-2020-28483).
  * **`golang.org/x/crypto` v0.0.0-20200622**: Falhas conhecidas no tratamento de cifragem (CVE-2021-43565).
* **Infraestrutura em Containers (Grype - [app-go/Dockerfile](app-go/Dockerfile)):**
  * Baseado na imagem **`golang:1.15-alpine`** com componentes do Alpine antigo e vulnerabilidades de compilação.
* **Vazamento de Segredos (Gitleaks - [app-go/config.go](app-go/config.go)):**
  * Chaves AWS fictícias e string de conexão Postgres em texto claro de produção.

---

## 🚀 Como Executar os Scanners de Segurança

### A. Detectando Segredos com o `Gitleaks`
O Gitleaks varre o repositório por completo e detecta chaves em todas as linguagens e no histórico Git:
```bash
# Rodar na raiz do repositorio
gitleaks detect --source=. --verbose
```

### B. Analisando Dependências Multilíngue com o `OSV-Scanner`
O OSV-Scanner detectará automaticamente todas as dependências vulneráveis nas três pastas:
```bash
# Executar a varredura recursiva na raiz do repositorio
osv-scanner --recursive ./
```
*(Nota: Você também pode rodar auditorias nativas nas pastas individuais como `npm audit` em `app-node/` ou `pip audit` em `app-python/`).*

### C. Varrendo Imagens de Container com o `Grype`
Para varrer e comparar as vulnerabilidades de sistema operacional entre os três módulos:

```bash
# 1. Construa as imagens locais
docker build -t lab-node:latest ./app-node
docker build -t lab-python:latest ./app-python
docker build -t lab-go:latest ./app-go

# 2. Varra cada uma das imagens usando o Grype
grype lab-node:latest
grype lab-python:latest
grype lab-go:latest
```

---

## 📊 Ambiente Integrado DevSecOps (MergeStat + PostgreSQL + Grafana)

Para simular um console corporativo de gestão de vulnerabilidades, este repositório possui duas opções de implantação do ambiente:

### Opção A: Stack Unificado e Completo (Recomendado)
Esta opção inicializa o **PostgreSQL, o MergeStat e o Grafana** já interligados na mesma rede Docker.
Na pasta raiz do repositório clonado na VM Ubuntu, execute:
```bash
docker-compose up -d
```

### Opção B: Implantação Oficial do MergeStat via Script
Se você deseja clonar e rodar o repositório oficial do MergeStat de forma isolada, utilize o script de automação **`setup-mergestat.sh`** fornecido na raiz deste repositório:
```bash
# 1. Dê permissão de execução ao script
chmod +x setup-mergestat.sh

# 2. Execute o script para clonar o repositório oficial e subir o docker-compose
./setup-mergestat.sh
```

> [!IMPORTANT]
> **Acesso a partir da máquina física (Hospedeira):**
> Se você estiver rodando o Docker dentro de uma VM no VirtualBox, os painéis não estarão diretamente acessíveis em `localhost` no navegador do seu sistema operacional principal. Para acessar, escolha uma das duas formas:
> 
> * **Método A: Redirecionamento de Portas no VirtualBox (Recomendado):**
>   1. Com a VM rodando, vá em **Configurações da VM** -> **Rede** -> **Adaptador 1** -> **Avançado** -> **Redirecionamento de Portas**.
>   2. Adicione as seguintes regras (deixe o campo IP em branco):
>      * Regra 1: Nome: `mergestat`, Protocolo: `TCP`, Porta Hospedeira: `3300`, Porta Convidada: `3300`
>      * Regra 2: Nome: `grafana`, Protocolo: `TCP`, Porta Hospedeira: `3000`, Porta Convidada: `3000`
>   3. Agora você poderá acessar diretamente do seu navegador da máquina física em:
>      * **MergeStat:** [http://localhost:3300](http://localhost:3300)
>      * **Grafana:** [http://localhost:3000](http://localhost:3000)
> 
> * **Método B: Acesso Direto via IP da VM (Rede em modo Bridge ou Host-Only):**
>   1. No terminal da VM Ubuntu, descubra o IP executando: `hostname -I` (ex: `192.168.56.101`).
>   2. Acesse do navegador da máquina hospedeira usando o IP:
>      * **MergeStat:** `http://<IP_DA_VM>:3300`
>      * **Grafana:** `http://<IP_DA_VM>:3000`

### 2. Configurar o MergeStat:
* Acesse a interface web do **MergeStat** (via localhost ou IP da VM).
* Vá em **Repos** e registre o link deste repositório Git.
* Vá em **Repo Syncs** -> **Add Sync** e ative as imagens de sincronização oficiais do `OSV-Scanner`, `Grype` e `Gitleaks`. Elas varrerão todas as três subpastas automaticamente!

### 3. Analisar no Grafana:
* Acesse a interface web do **Grafana** (usuário: `admin` / senha: `admin`).
* Conecte o PostgreSQL do MergeStat como Data Source (usando o IP do container ou da rede Docker) para montar os dashboards analíticos de vulnerabilidades consolidados.

---

## 🎓 Uso Acadêmico
Este repositório foi construído especificamente para fins pedagógicos. sinta-se à vontade para clonar, executar os testes em diferentes ecossistemas de desenvolvimento e analisar como as ferramentas open-source lidam com a detecção de CVEs e credenciais vazadas em múltiplas tecnologias.
