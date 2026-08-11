import dns.resolver
import smtplib
import time
import os
from datetime import datetime
from email.message import EmailMessage

DOMINIO = "jessicavendramine.com.br"

IPS_ESPERADOS = {
    "185.199.108.153",
    "185.199.109.153",
    "185.199.110.153",
    "185.199.111.153",
}

INTERVALO = 15  # 5 minutos


def consultar_dns(servidor):
    resolver = dns.resolver.Resolver(configure=False)
    resolver.nameservers = [servidor]
    resolver.timeout = 5
    resolver.lifetime = 5

    try:
        resposta = resolver.resolve(DOMINIO, "A")
        return {str(r) for r in resposta}
    except Exception as e:
        print(f"Erro consultando {servidor}: {e}")
        return set()


def enviar_email():
    remetente = os.environ["DNS_EMAIL_USER"]
    senha = os.environ["DNS_EMAIL_PASSWORD"]
    destinatario = os.environ["DNS_EMAIL_DESTINO"]

    msg = EmailMessage()
    msg["Subject"] = "✅ DNS da Jéssica está funcionando"
    msg["From"] = remetente
    msg["To"] = destinatario

    msg.set_content(
        f"""
O domínio {DOMINIO} já está resolvendo corretamente para o GitHub Pages.

IPs encontrados:

185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153

Agora você pode voltar ao GitHub:

Settings → Pages → Check again

Horário da detecção:
{datetime.now().strftime("%d/%m/%Y %H:%M:%S")}
"""
    )

    with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
        smtp.starttls()
        smtp.login(remetente, senha)
        smtp.send_message(msg)


print(f"Monitorando {DOMINIO}...")
print("Ctrl+C para encerrar.\n")

while True:
    google = consultar_dns("8.8.8.8")
    cloudflare = consultar_dns("1.1.1.1")

    agora = datetime.now().strftime("%H:%M:%S")

    print(f"[{agora}]")
    print(f"Google:     {google or 'ainda sem resposta A'}")
    print(f"Cloudflare: {cloudflare or 'ainda sem resposta A'}")

    google_ok = IPS_ESPERADOS.issubset(google)
    cloudflare_ok = IPS_ESPERADOS.issubset(cloudflare)

    if google_ok and cloudflare_ok:
        print("\n✅ DNS propagado no Google e Cloudflare!")
        print("Enviando e-mail...")

        enviar_email()

        print("📧 E-mail enviado.")
        break

    print(f"Ainda não. Nova tentativa em {INTERVALO // 60} minutos.\n")
    time.sleep(INTERVALO)

'''$env:DNS_EMAIL_USER="rafael.zerunian@gmail.com"
$env:DNS_EMAIL_PASSWORD="ofpm bkfs othk dnag"
$env:DNS_EMAIL_DESTINO="rafael.zerunian@gmail.com"'''