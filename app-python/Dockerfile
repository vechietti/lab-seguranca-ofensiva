# Utiliza uma imagem base do Python intencionalmente desatualizada e vulneravel
FROM python:3.6-slim

WORKDIR /usr/src/app

COPY requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD [ "python", "main.py" ]
