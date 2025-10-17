# 📋 ISTRUZIONI SVILUPPO - Configuratore Enterprise

## 🔧 Setup Ambiente

### Dipendenze
```bash
npm install
```

### Variabili Ambiente (.env.local)
```env
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Email Service
RESEND_API_KEY=re_6SoqiqEV_2u8wtWwGjC9W6E5DF7Ghcpzt

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Deploy
```bash
npm run build
git push
```

## 📧 CONFIGURAZIONE EMAIL RESEND

### Stato Attuale (Testing)
- **Destinatario**: `a.guarnieri.portfolio@gmail.com` (email verificata)
- **Mittente**: `onboarding@resend.dev` (dominio Resend di default)
- **Limitazione**: Solo email di test al proprietario account

### Setup Produzione per Cliente
Quando il cliente avrà il suo dominio personalizzato:

1. **Verifica Dominio su Resend**
   - Vai su https://resend.com/domains
   - Aggiungi il dominio del cliente (es. `cliente.com`)
   - Configura record DNS:
     ```
     Type: MX | Name: cliente.com | Value: feedback-smtp.eu-west-1.amazonses.com
     Type: TXT | Name: cliente.com | Value: "v=spf1 include:amazonses.com ~all"
     Type: CNAME | Name: [codice]._domainkey.cliente.com | Value: [codice].dkim.amazonses.com
     ```

2. **Aggiorna Codice**
   ```typescript
   // In src/app/api/submit-quote-request/route.ts
   from: 'noreply@cliente.com',  // Cambia da onboarding@resend.dev
   to: 'info@cliente.com',       // Cambia da a.guarnieri.portfolio@gmail.com
   ```

3. **Deploy Modifiche**
   ```bash
   git add . && git commit -m "Update email addresses for client domain" && git push
   ```

### Note Tecniche
- Resend richiede dominio verificato per inviare a destinatari esterni
- Durante sviluppo/test usare sempre email verificata del dev
- Verificare SPF/DKIM records per deliverability ottimale
- Monitorare bounce rate e reputation dominio

## 🚀 Deploy Production
- **URL**: https://configuratore-enterprise.vercel.app/
- **Branch**: main
- **Auto-deploy**: Attivo su push

## 🔐 Environment Variables Vercel
Configurate in Production:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY` 
- `RESEND_API_KEY`

## 📦 Architettura
- **Next.js 15** con App Router
- **React 19** con Context API
- **TypeScript** strict mode
- **Tailwind CSS** per styling
- **Stripe** per pagamenti
- **Resend** per email notifications