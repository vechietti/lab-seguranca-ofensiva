# Cuidado: Segredos expostos intencionalmente para fins de teste com Gitleaks
PORT = 5000
ENV = 'production'

# Credenciais ficticias da AWS no formato detectado por scanners
AWS_ACCESS_KEY_ID = 'AKIA5V6B7C8D9E0F1G2H'
AWS_SECRET_ACCESS_KEY = 'eXaMpLeKeY/wJalrXUtnFEMI/K7MDENG/bPxRfiCY'

# Token de API do Slack ficticio
SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/MOCK_TOKEN_SLACK_NOT_REAL_KEY'

# String de conexao PostgreSQL em texto claro
DATABASE_URL = 'postgresql://db_user_python:P@sswordPython123@postgres-server.internal:5432/prod_python_db'
