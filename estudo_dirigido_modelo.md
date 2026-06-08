# Estudo Dirigido: Gestão de Vulnerabilidades e Vazamento de Segredos (Roteiro de Execução Prática)

Este documento é o roteiro completo passo a passo que você (colega validador) deve seguir para configurar, testar e avaliar a segurança estática da aplicação multilíngue do laboratório utilizando **OSV-Scanner, Grype, Gitleaks, MergeStat e Grafana**.

---

## 1. Objetivo
Demonstrar na prática como identificar, centralizar e monitorar vulnerabilidades de dependências (SCA), imagens de containers e vazamento de chaves no histórico Git usando um console de gestão integrado de DevSecOps.

## 2. Contextualização das Ferramentas do Laboratório
* **OSV-Scanner (Google):** Escaneia recursivamente as dependências declaradas em Node.js, Python e Go buscando por falhas (CVEs) públicas.
* **Grype (Anchore):** Varre as imagens Docker das três aplicações apontando pacotes obsoletos de SO.
* **Gitleaks:** Escaneia o histórico do Git em busca de chaves da AWS, Slack e credenciais de bancos de dados.
* **MergeStat:** Orquestrador central que roda os scanners no repositório e insere as falhas estruturadas em um banco PostgreSQL.
* **Grafana:** Dashboard de análise visual dos riscos coletados.

---

## 3. Missão de Pentest
* **Objetivo da Análise:** Auditar o repositório Git em busca de brechas e centralizar as métricas de severidade.
* **Tipo de Alvo:** Repositório Git público (`https://github.com/vechietti/lab-seguranca-ofensiva`).
* **Etapa do Pentest:** Scanning (Varredura) e Enumeração de Falhas.

---

## 4. Requisitos do Ambiente
Para executar esta atividade, você precisará de:
* Uma máquina hospedeira (seu sistema operacional principal) com navegador web.
* O software **VirtualBox** instalado na máquina hospedeira.
* A máquina virtual (VM) **Ubuntu** com o **Docker** e **Docker Compose** instalados nela.
* Conexão ativa com a internet para baixar as imagens e rodar os scanners.

---

## 5. Instalação e Configuração Passo a Passo (Dentro da VM)

Siga os passos exatos no terminal da sua máquina virtual Ubuntu:

### Passo 1: Iniciar a VM no VirtualBox
1. Abra o VirtualBox na sua máquina física.
2. Selecione a máquina virtual do **Ubuntu** e clique em **Iniciar**.
3. Realize o login no Ubuntu.

### Passo 2: Clonar o Repositório do Laboratório
Abra o terminal dentro da VM Ubuntu e execute o comando para clonar o projeto:
```bash
git clone https://github.com/vechietti/lab-seguranca-ofensiva.git
cd lab-seguranca-ofensiva
```

### Passo 3: Inicializar a Infraestrutura com Docker Compose
Na pasta raiz do repositório clonado, suba os serviços do banco Postgres, MergeStat e Grafana:
```bash
docker-compose up -d
```
*Verifique se todos os contêineres estão rodando corretamente:*
```bash
docker ps
```

### Passo 4: Configurar o Redirecionamento de Portas no VirtualBox
Para acessar os painéis do MergeStat e do Grafana diretamente do navegador do seu computador físico (fora da VM), configure o redirecionamento:
1. Com a VM rodando, na janela do VirtualBox vá no menu superior: **Dispositivos** -> **Rede** -> **Preferências de Rede...**
2. Selecione o Adaptador ativo (geralmente em modo *NAT*) e clique em **Avançado** -> **Redirecionamento de Portas**.
3. Adicione duas regras clicando no ícone verde de adição `+` (deixe os campos de IP em branco):
   * **Regra 1 (MergeStat):** Nome: `mergestat` \| Protocolo: `TCP` \| Porta Hospedeira: `3300` \| Porta Convidada: `3300`
   * **Regra 2 (Grafana):** Nome: `grafana` \| Protocolo: `TCP` \| Porta Hospedeira: `3000` \| Porta Convidada: `3000`
4. Clique em **OK** para salvar.

---

## 6. Execução Passo a Passo da Varredura e Dashboards

Agora você fará a configuração e as varreduras de segurança a partir da sua máquina física:

### Passo 5: Configurar e Rodar os Scanners no MergeStat
1. No navegador do seu computador físico, acesse: [http://localhost:3300](http://localhost:3300) (MergeStat).
2. Vá na aba **Repos** e clique em **Add Repo**.
3. Cole a URL pública do repositório no campo correspondente:
   `https://github.com/vechietti/lab-seguranca-ofensiva`
4. Após o repositório ser adicionado, clique nele e navegue até a aba **Repo Syncs**.
5. Clique em **Add Sync** e configure os 3 sincronizadores abaixo:
   * **SCA (OSV-Scanner):** Selecione o scanner correspondente. Ele detectará recursivamente as dependências vulneráveis do Node (`app-node`), Python (`app-python`) e Go (`app-go`).
   * **Containers (Grype):** Adicione a varredura do filesystem dos Dockerfiles para detectar pacotes de SO obsoletos.
   * **Segredos (Gitleaks):** Adicione o sync do Gitleaks. Ele lerá a história do Git em busca das credenciais.
6. Acompanhe a execução e aguarde até que o status de todos os syncs mude de *Pending/Running* para **Success** (ícone verde).

### Passo 6: Conectar o PostgreSQL no Grafana
1. No navegador do seu computador físico, acesse: [http://localhost:3000](http://localhost:3000) (Grafana).
2. Entre com o usuário `admin` e a senha `admin` (se pedir para alterar a senha, você pode clicar em *Skip*).
3. No menu lateral, acesse **Connections** -> **Data Sources** -> **Add Data Source** e selecione o **PostgreSQL**.
4. Configure as seguintes credenciais para conectar ao banco do MergeStat (como o Grafana está na mesma rede Docker, usamos o nome do serviço `db` como Host):
   * **Host:** `db:5432`
   * **Database:** `mergestat`
   * **User:** `postgres`
   * **Password:** `password`
   * **SSL Mode:** `disable`
5. Role a página e clique no botão **Save & Test**. Você deve ver uma mensagem verde confirmando que o banco de dados está conectado.
6. **Importar o Dashboard do Laboratório:**
   * Para visualizar o painel do scanner igual ao modelo oficial do blog da Grafana, baixe o arquivo de configuração oficial [neste link (GitHub oficial do MergeStat)](https://github.com/mergestat/mergestat/blob/main/examples/git/vulnerabilities/trivy/grafana/trivy.json) ou acesse a versão do OSV-Scanner no repositório.
   * No menu do Grafana, clique no ícone **Dashboards** -> **New** -> **Import**.
   * Faça o upload do arquivo `.json` baixado ou cole o conteúdo do JSON, selecione o Data Source do PostgreSQL (`mergestat`) que você acabou de conectar e clique em **Import**.
   * Você verá o dashboard completo renderizado com gráficos de pizza por severidade e tabelas alimentadas pelos dados coletados de Node, Python e Go!

---

## 7. Evidências da Execução (A Ser Preenchido pelo Colega)
*Cole aqui as provas visuais de que você rodou o laboratório com sucesso:*

* **Evidência 1: Print do painel MergeStat mostrando os 3 Syncs finalizados com Success:**
  `[COLE O PRINT AQUI]`

* **Evidência 2: Print do painel do Grafana exibindo os dados das vulnerabilidades coletadas:**
  `[COLE O PRINT AQUI]`

* **Evidência 3: Tabela ou log exportado do Gitleaks demonstrando as chaves AWS, Slack e credenciais detectadas no histórico:**
  `[COLE O PRINT/TEXTO AQUI]`

---

## 8. Interpretação Técnica dos Resultados (A Ser Preenchido pelo Colega)
*Escreva a sua análise sobre o impacto dos riscos encontrados:*
1. **Qual ecossistema (Node, Python ou Go) apresentou as dependências SCA mais críticas?**
   `[Sua resposta aqui]`
2. **Explique a diferença de criticidade encontrada na imagem Docker do Node (`node:10.16.0-alpine`) versus a do Python (`python:3.6-slim`).**
   `[Sua resposta aqui]`
3. **Como o Gitleaks conseguiu detectar o arquivo `.env` com chaves sensíveis se ele não está mais visível na pasta raiz do repositório?**
   `[Sua resposta aqui]`

---

## 9. Mitigações e Contramedidas (A Ser Preenchido pelo Colega)
*Com base nas falhas encontradas, o que deve ser feito para corrigir a aplicação?*
1. **Correção das Dependências (SCA):**
   `[Sua resposta aqui]`
2. **Correção das Imagens Docker (Grype):**
   `[Sua resposta aqui]`
3. **Tratamento de Vazamento de Segredos (Gitleaks):**
   `[Sua resposta aqui]`

---

## 10. Referências Técnicas
* Repositório Oficial do Gitleaks: https://github.com/gitleaks/gitleaks
* Banco de Dados de Vulnerabilidades OSV: https://osv.dev/
* Grafana & MergeStat Tutorial: https://grafana.com/blog/2023/05/26/how-to-manage-cve-security-vulnerabilities-with-grafana-mergestat-and-osv-scanner/
