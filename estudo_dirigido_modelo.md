# Estudo Dirigido: Gestão de Vulnerabilidades e Vazamento de Segredos (Roteiro de Execução Prática)

Este documento é o roteiro completo passo a passo que você (colega validador) deve seguir para configurar, testar e avaliar a segurança estática da aplicação multilíngue do laboratório utilizando **OSV-Scanner, Grype, Gitleaks, MergeStat e Grafana**.

> **Como os scanners aparecem no lab:** OSV-Scanner roda **via CLI standalone** (não há sync pré-cadastrado para ele na versão `2.3.2-beta` do MergeStat usada aqui). Dentro do console do MergeStat, a análise SCA é feita pelo **Scan Trivy**, e as varreduras de containers e segredos pelos syncs **Scan Grype** e **Scan Gitleaks**.

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

### Passo 3: Inicializar a Infraestrutura
Na pasta raiz do repositório clonado, suba os serviços do banco Postgres, MergeStat e Grafana já interligados na mesma rede Docker:
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
2. Na tela de login, o MergeStat reaproveita as **credenciais do banco PostgreSQL** definidas no `docker-compose.yml`. Informe:
   * **Database user:** `postgres`
   * **Database password:** `password`
3. No menu lateral, clique em **Repos** → botão **Add Repo** (canto superior direito).
4. Cole a URL pública do repositório no campo correspondente e clique em **Save**:
   ```
   https://github.com/vechietti/lab-seguranca-ofensiva
   ```
5. Clique no repositório recém-adicionado e navegue até a aba **Repo Syncs**.
6. Clique em **Add Sync** e adicione, **um por vez**, os três scanners abaixo (todos vêm pré-cadastrados na versão `2.3.2-beta` do console):

   | Sync no MergeStat | Cobertura no lab |
   |---|---|
   | **Scan Gitleaks** | Varre o histórico Git em busca de chaves AWS, GitHub PAT, Slack webhook e strings de conexão Postgres/Mongo. |
   | **Scan Grype** | Detecta CVEs de SO nas imagens Docker `node:10.16.0-alpine`, `python:3.6-slim` e `golang:1.15-alpine`. |
   | **Scan Trivy** | Faz a análise SCA das dependências dos três módulos (`package.json`, `requirements.txt`, `go.mod`). |

   > **Sobre o OSV-Scanner:** o sync de OSV-Scanner **não vem pré-cadastrado** no console do MergeStat `2.3.2-beta` — por isso usamos o **Scan Trivy** para o papel de SCA dentro do console. O OSV-Scanner pode ser rodado em paralelo via CLI standalone (ver seção "Como Executar os Scanners de Segurança" do `README.md`) se você quiser comparar resultados.

7. Em cada linha de sync, clique em **Sync Now** (ou **Run**) à direita para disparar a execução. A primeira execução do Grype/Trivy demora alguns minutos enquanto baixa o banco de CVEs.
8. Acompanhe a coluna **Status** até que todos os três syncs mudem de *Pending/Running* para **Success** (ícone verde).

### Passo 6: Acessar o Dashboard do Grafana (já provisionado)

O Grafana deste laboratório já vem **pré-configurado** via provisioning:
* **Data Source** PostgreSQL apontando para o banco do MergeStat (definida em [grafana/provisioning/datasources/datasource.yml](grafana/provisioning/datasources/datasource.yml)).
* **Dashboard do Trivy** já importado a partir de [grafana/dashboards/trivy.json](grafana/dashboards/trivy.json) (baseado no JSON oficial do MergeStat).

1. No navegador do seu computador físico, acesse: [http://localhost:3000](http://localhost:3000) (Grafana). Você entra direto como Admin anônimo — sem precisar de login.
2. No menu lateral, clique em **Dashboards** e abra o dashboard **Trivy** (ou acesse direto em [http://localhost:3000/d/PyNLihsdf/trivy](http://localhost:3000/d/PyNLihsdf/trivy)).
3. Após os syncs do MergeStat finalizarem com sucesso (Passo 5), o painel será populado automaticamente com os CVEs detectados nos três módulos (Node, Python, Go) — gráficos por severidade, tabelas com pacotes vulneráveis e contadores agregados.

> **Quer comparar com o OSV-Scanner?** O dashboard equivalente para OSV está em [https://github.com/mergestat/mergestat/blob/main/examples/git/vulnerabilties/osv-scanner/grafana/osv-scanner.json](https://github.com/mergestat/mergestat/blob/main/examples/git/vulnerabilties/osv-scanner/grafana/osv-scanner.json). Você pode importá-lo manualmente via **Dashboards → New → Import** caso tenha rodado o OSV-Scanner via CLI standalone. Atenção: a pasta no repo oficial é `vulnerabilties` (sem o "i") — substituir por "vulnerabilities" dá 404.

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
