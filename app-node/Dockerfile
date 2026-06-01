# Utiliza uma imagem base intencionalmente desatualizada e vulneravel
FROM node:10.16.0-alpine

# Define o diretorio de trabalho dentro do container
WORKDIR /usr/src/app

# Copia os arquivos de dependencias
COPY package.json ./

# Instala as dependencias do node
RUN npm install

# Copia o restante do codigo-fonte
COPY . .

# Expõe a porta em que a aplicacao rodará
EXPOSE 3000

# Executa a aplicacao
CMD [ "npm", "start" ]
