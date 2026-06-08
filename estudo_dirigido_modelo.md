# Estudo Dirigido: Gestão de Vulnerabilidades e Vazamento de Segredos (DevSecOps Multilíngue)

Este documento serve como modelo de estudo dirigido para a entrega da atividade prática da disciplina de **Segurança Ofensiva**, baseado estritamente na integração do repositório vulnerável multilíngue (Node.js, Python e Go) com **MergeStat, PostgreSQL e Grafana**.

---

## 1. Objetivo
O objetivo deste estudo dirigido é demonstrar de forma prática como identificar, gerenciar e visualizar vulnerabilidades de segurança (CVEs) em múltiplos ecossistemas de desenvolvimento (Node.js, Python e Go) e imagens de containers, bem como o vazamento de segredos, utilizando um conjunto de ferramentas open-source integrado. O roteiro detalha a varredura e a consolidação de relatórios em um painel unificado de monitoramento contínuo para análise de riscos.

## 2. Contextualização das Ferramentas
Adotando a abordagem *shift-left* de segurança na cadeia de suprimentos de software, o stack utilizado é:
* **OSV-Scanner:** Analisador do Google que examina as dependências do código em busca de CVEs conhecidas no ecossistema de código aberto (varre recursivamente manifests de Node.js, Python e Go).
* **Grype:** Scanner da Anchore focado em vulnerabilidades de imagens de contêineres e pacotes de sistema operacional.
* **Gitleaks:** Detector projetado para rastrear chaves de API, senhas e tokens expostos em arquivos de configuração e no histórico completo do Git.
* **MergeStat:** Plataforma que coleta as saídas dos scanners e as sincroniza de maneira estruturada dentro de um banco de dados PostgreSQL.
* **Grafana:** Painel de visualização dinâmica integrado ao banco de dados para consolidação visual das métricas de vulnerabilidades.

*No contexto do pentest, estas ferramentas se aplicam primordialmente à etapa de **Scanning (Varredura) e Enumeração**.*

## 3. Missão de Pentest
* **Objetivo da Análise:** Detectar e catalogar vulnerabilidades de dependências (SCA), falhas em containers de múltiplos ecossistemas (Node, Python, Go) e identificar vazamentos de dados sensíveis (segredos/tokens).
* **Tipo de Alvo:** Repositório Git público intencionalmente vulnerável que simula códigos legados, imagens desatualizadas e credenciais expostas no histórico.
* **Hipótese de Investigação:** Um atacante pode obter acesso indevido ou comprometer a infraestrutura ao explorar componentes com falhas conhecidas de execução remota de código (RCE) ou obter chaves de nuvem e banco expostas nos diferentes módulos.
* **Etapa Relacionada:** Scanning, Varredura de Vulnerabilidades e OSINT.
* **Resultado Esperado:** Obtenção de um dashboard visual unificado no Grafana reportando as CVEs e chaves expostas nas três linguagens.

## 4. Modelagem do Cenário
* **Estrutura do Laboratório:** Repositório Git vulnerável no GitHub analisado por instâncias locais do Grafana e MergeStat executadas em um ecossistema Docker Compose.
* **Serviços Envolvidos:**
  * Instância do banco de dados PostgreSQL.
  * Servidor local do MergeStat (orquestrando syncs de OSV-Scanner, Grype e Gitleaks).
  * Painel do Grafana.
* **Riscos Avaliados e Impactos:** Comprometimento da aplicação por execução de dependência vulnerável (ex: Prototype Pollution no Lodash em Node.js ou Sandbox Escape no Jinja2 em Python), escalada de privilégios via imagem DockerAlpine/Debian legada e comprometimento de contas AWS/GitHub por tokens vazados.

## 5. Requisitos do Ambiente
* Docker e Docker Compose instalados (caso execute em VM Ubuntu no VirtualBox, garanta que o Docker daemon esteja ativo).
* Redirecionamento de portas configurado no VirtualBox para as portas `3300` (MergeStat) e `3000` (Grafana), ou acesso via IP de rede da VM.
* Conta ativa no GitHub para gerenciamento do repositório alvo.
* Acesso à internet para download de imagens e sincronização.

## 6. Instalação e Configuração
A configuração do laboratório está estruturada em duas partes:
1. **Preparação do Alvo:** Criação do repositório no GitHub com dependências antigas (`app-node/package.json`, `app-python/requirements.txt`, `app-go/go.mod`), Dockerfiles vulneráveis e commits simulados com chaves no histórico Git (`app-node/config.js`, `app-python/config.py`, `app-go/config.go`).
2. **Preparação das Ferramentas:** Inicialização do stack de monitoramento a partir do arquivo `docker-compose.yml` que provisiona os serviços de banco, MergeStat e Grafana em uma rede local isolada.

## 7. Execução Passo a Passo
Com o Docker rodando em sua máquina (ou VM), siga a sequência lógica de execução:
1. Acesse o **MergeStat** em `http://localhost:3300` (ou `http://<IP_DA_VM>:3300` se estiver acessando a VM sem redirecionamento de portas).
2. Vá até a aba **Repos** e insira a URL pública do seu repositório de testes do GitHub.
3. Navegue até a seção **Repo Syncs** e clique em **Add Sync**.
4. Configure as três ferramentas de scanning (`OSV`, `Grype` e `Gitleaks`) apontando para o seu repositório.
5. Após a conclusão bem-sucedida dos sincronismos (Syncs), abra o **Grafana** em `http://localhost:3000` (ou `http://<IP_DA_VM>:3000`).
6. Adicione o banco de dados PostgreSQL do laboratório como *Data Source* e importe o painel para consolidação analítica.

## 8. Comandos e Procedimentos Utilizados
Procedimentos exatos executados para a montagem do ambiente de monitoramento:
```bash
# 1. Inicializar o stack integrado de ferramentas
docker-compose up -d

# 2. Imagens oficiais de Sync do MergeStat para execução das varreduras
# OSV-Scanner recursivo: ghcr.io/mergestat/sync-scan-osv:latest
# Siga o procedimento padrão adicionando a varredura do filesystem e histórico de commits para Grype e Gitleaks.
```

## 9. Evidências da Execução
*(Insira neste espaço as capturas de tela e evidências obtidas durante o laboratório)*
* **Evidência 1: Tela do MergeStat demonstrando os Syncs concluídos com sucesso nas três linguagens.**
  *(Inserir print de tela)*
* **Evidência 2: Dashboard do Grafana exibindo os gráficos consolidados de severidade das falhas (CVEs) de Node, Python e Go.**
  *(Inserir print)*
* **Evidência 3: Tabela ou log identificando a chave de API detectada pelo Gitleaks no histórico Git das três aplicações.**
  *(Inserir print ou bloco de texto)*

## 10. Interpretação Técnica dos Resultados
* **Riscos Encontrados:** O OSV-Scanner e o Grype relataram falhas de criticidade Alta e Crítica presentes nos pacotes de Node, Python, Go e em suas respectivas imagens Docker base. O Gitleaks encontrou com êxito os tokens expostos (`ghp_...` e `AKIA...`) no histórico de commits.
* **Relevância Técnica:** A orquestração multilíngue do MergeStat demonstra que uma única estrutura de DevSecOps consegue capturar e analisar riscos em equipes que usam stacks de tecnologia diferentes, centralizando a gestão de forma holística.
* **Limitações:** Scanners estáticos dependem de assinaturas pré-catalogadas, não identificando falhas em bibliotecas customizadas internas desenvolvidas pela própria empresa.

## 11. Mitigações e Contramedidas
* **Mitigação de CVEs (SCA e Imagem):** Atualizar as bibliotecas vulneráveis declaradas (`app-node/package.json`, `app-python/requirements.txt`, `app-go/go.mod`) e migrar os Dockerfiles para imagens base minimalistas atualizadas (ex: `node:20-alpine`, `python:3.11-slim`, `golang:1.21-alpine`).
* **Mitigação de Segredos Vazados:** Revogação imediata das chaves vazadas. Segredos corporativos devem residir em cofres criptografados dinâmicos (como AWS Secrets Manager ou Vault) e referenciados por injeção na runtime.
* **Segurança na Integração Contínua (CI/CD):** Acoplar estes mesmos scanners de forma nativa nas branches de desenvolvimento para falhar o build (quebrar PRs) antes que códigos com novos riscos sejam mesclados no repositório principal.

## 12. Referências Técnicas
* Tutorial de Integração (Grafana, MergeStat e OSV): https://grafana.com/blog/2023/05/26/how-to-manage-cve-security-vulnerabilities-with-grafana-mergestat-and-osv-scanner/
* Repositório Oficial do Grype: https://github.com/anchore/grype
* GitHub Oficial Gitleaks: https://github.com/gitleaks/gitleaks
