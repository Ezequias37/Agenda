# 📧 Guia de Testes - Envio de E-mail

## ✅ Status da Análise

### Problemas Encontrados e Corrigidos:
- ✅ **Arquivo corrompido**: `EmailService.java` continha XML do pom.xml misturado
- ✅ **Corrigido**: Removido código XML do arquivo de serviço

### Estrutura do Projeto:
```
src/main/java/com/lmbronze/agenda/
├── service/EmailService.java          ✅ Serviço de envio de e-mail
├── controller/AgendaController.java   ✅ Já integrado com EmailService
├── model/
│   ├── Agendamento.java               ✅ Modelo de agendamento
│   ├── Cliente.java                   ✅ Modelo com email validado
│   └── StatusAgendamento.java         ✅ Enum de status
└── repository/                        ✅ JPA repositories

src/main/resources/
└── application.properties              ✅ Configuração Mailtrap

src/test/java/
└── service/EmailServiceTest.java      ✅ Testes unitários (Mockito)
```

---

## 🚀 Como Testar

### **Opção 1: Rodar a Aplicação e Testar via HTTP**

#### Passo 1: Iniciar a aplicação Spring Boot
```bash
cd C:\Users\W3ERP - Ezequias\Desktop\LMBRONZE\agenda
mvnw.cmd spring-boot:run
```

A aplicação estará disponível em: `http://localhost:8080`

#### Passo 2: Executar o script de teste
```powershell
# No PowerShell (em outro terminal)
cd C:\Users\W3ERP - Ezequias\Desktop\LMBRONZE\agenda
.\test-email.ps1
```

Ou testar manualmente com curl:

#### Passo 3: Criar um cliente (manual)
```bash
curl -X POST http://localhost:8080/api/clientes \
  -H "Content-Type: application/json" \
  -d '{"nome":"João","email":"joao@test.com","telefone":"11999999999"}'
```

#### Passo 4: Criar agendamento (dispara envio de e-mail)
```bash
curl -X POST http://localhost:8080/api/agendamentos \
  -H "Content-Type: application/json" \
  -d '{"cliente":{"id":1},"dataHora":"2026-05-25T14:30:00","descricao":"Consulta","status":"AGENDADO"}'
```

#### Passo 5: Cancelar agendamento (dispara envio de cancelamento)
```bash
curl -X DELETE http://localhost:8080/api/agendamentos/1
```

---

### **Opção 2: Rodar Testes Unitários**

```bash
cd C:\Users\W3ERP - Ezequias\Desktop\LMBRONZE\agenda
mvnw.cmd test -Dtest=EmailServiceTest
```

**Resultado esperado:**
```
Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
✅ deveEnviarEmailConfirmacaoDeAgendamento
✅ deveEnviarEmailCancelamentoDeAgendamento
```

---

## 🔧 Configuração de E-mail (Mailtrap)

**Provider**: Mailtrap (sandbox SMTP)
**Host**: `sandbox.smtp.mailtrap.io`
**Port**: `2525`
**Credenciais**: Em `src/main/resources/application.properties`

### Como ver os e-mails enviados:
1. Acesse: https://mailtrap.io
2. Faça login
3. Vá para a caixa de entrada do projeto
4. Você verá todos os e-mails enviados via sandbox

---

## 📋 Fluxo de E-mail Implementado

### 1. **Confirmação de Agendamento**
- **Disparador**: Criar novo agendamento (POST `/api/agendamentos`)
- **Destinatário**: E-mail do cliente
- **Assunto**: "Confirmação de Agendamento"
- **Conteúdo**: 
  - Nome do cliente
  - Data e hora
  - Descrição
  - Status

### 2. **Cancelamento de Agendamento**
- **Disparador**: Deletar agendamento (DELETE `/api/agendamentos/{id}`)
- **Destinatário**: E-mail do cliente
- **Assunto**: "Cancelamento de Agendamento"
- **Conteúdo**:
  - Nome do cliente
  - Data e hora
  - Descrição

---

## 🐛 Tratamento de Erros

O `EmailService` possui:
- ✅ Try-catch para capturar erros de envio
- ✅ Logs de sucesso/erro em console
- ✅ Não interrompe o fluxo se falhar

```java
try {
    mailSender.send(message);
    System.out.println("Email enviado para: " + email);
} catch (Exception e) {
    System.err.println("Erro ao enviar email: " + e.getMessage());
}
```

---

## 📝 Resumo das Funcionalidades

| Funcionalidade | Status | Teste |
|---|---|---|
| Envio de confirmação | ✅ Implementado | test-email.ps1 |
| Envio de cancelamento | ✅ Implementado | test-email.ps1 |
| Validação de e-mail | ✅ @Email no modelo | Automático |
| Integração com controller | ✅ Chamadas no POST/DELETE | HTTP |
| Testes unitários | ✅ EmailServiceTest.java | `mvnw test` |
| Configuração SMTP | ✅ Mailtrap sandbox | application.properties |

---

## 🎯 Próximos Passos (Opcional)

Se desejar melhorias futuras:
- [ ] E-mails com HTML (em vez de text/plain)
- [ ] Templates de e-mail
- [ ] Fila assíncrona (RabbitMQ/Kafka)
- [ ] Retry automático em caso de falha
- [ ] Logs persistidos em banco de dados
- [ ] Integração com SendGrid ou AWS SES

---

**Status**: ✅ Pronto para testes!
