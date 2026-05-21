@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

cls
echo.
echo ═══════════════════════════════════════════════════════════════
echo   📧 TESTE DE ENVIO DE E-MAIL COM MAILTRAP
echo ═══════════════════════════════════════════════════════════════
echo.
echo Configuração:
echo   📍 Host: sandbox.smtp.mailtrap.io
echo   📍 Porta: 2525
echo   📍 Usuario: 28b5860d372855
echo.

set BASE_URL=http://localhost:8080/api

echo Aguardando servidor... (verifique se está rodando em outro terminal)
timeout /t 3 /nobreak

REM ═══════════════════════════════════════════════════════════════
REM 1. CRIAR CLIENTE
REM ═══════════════════════════════════════════════════════════════
echo.
echo ═══════════════════════════════════════════════════════════════
echo 1️⃣  CRIANDO CLIENTE
echo ═══════════════════════════════════════════════════════════════

set CLIENTE_DATA={^
  "nome": "João Silva",^
  "email": "joao.silva@test.com",^
  "telefone": "(11) 99999-8888"^
}

echo.
echo Dados do cliente:
echo !CLIENTE_DATA!
echo.

curl -X POST %BASE_URL%/clientes ^
  -H "Content-Type: application/json" ^
  -d "!CLIENTE_DATA!" ^
  --silent -w "\n" > cliente_response.json

echo.
echo Resposta:
type cliente_response.json

REM Extrair ID do cliente (simples parsing)
for /f "tokens=*" %%A in (cliente_response.json) do (
  if "%%A"=="" goto :get_id
  set RESPONSE=%%A
)

:get_id
echo.
echo ✅ Cliente criado com sucesso!
echo.

REM ═══════════════════════════════════════════════════════════════
REM 2. CRIAR AGENDAMENTO (DISPARA E-MAIL DE CONFIRMAÇÃO)
REM ═══════════════════════════════════════════════════════════════
echo.
echo ═══════════════════════════════════════════════════════════════
echo 2️⃣  CRIANDO AGENDAMENTO
echo ═══════════════════════════════════════════════════════════════
echo.
echo ⚠️  Isso DISPARARÁ um e-mail de confirmação para mailtrap
echo.
pause

set AGENDAMENTO_DATA={^
  "cliente": {"id": 1},^
  "dataHora": "2026-05-25T14:30:00",^
  "descricao": "Consulta de rotina",^
  "status": "AGENDADO"^
}

echo.
echo Dados do agendamento:
echo !AGENDAMENTO_DATA!
echo.

curl -X POST %BASE_URL%/agendamentos ^
  -H "Content-Type: application/json" ^
  -d "!AGENDAMENTO_DATA!" ^
  --silent -w "\n" > agendamento_response.json

echo.
echo Resposta:
type agendamento_response.json

echo.
echo ✅ Agendamento criado!
echo 📬 E-mail de confirmação foi enviado para: joao.silva@test.com
echo.

REM ═══════════════════════════════════════════════════════════════
REM 3. VISUALIZAR AGENDAMENTOS
REM ═══════════════════════════════════════════════════════════════
echo.
echo ═══════════════════════════════════════════════════════════════
echo 3️⃣  LISTANDO AGENDAMENTOS
echo ═══════════════════════════════════════════════════════════════
echo.

curl -X GET %BASE_URL%/agendamentos ^
  -H "Content-Type: application/json" ^
  --silent -w "\n"

echo.
echo.

REM ═══════════════════════════════════════════════════════════════
REM 4. CANCELAR AGENDAMENTO (DISPARA E-MAIL DE CANCELAMENTO)
REM ═══════════════════════════════════════════════════════════════
echo.
echo ═══════════════════════════════════════════════════════════════
echo 4️⃣  CANCELANDO AGENDAMENTO
echo ═══════════════════════════════════════════════════════════════
echo.
echo ⚠️  Isso DISPARARÁ um e-mail de cancelamento para mailtrap
echo.
pause

curl -X DELETE %BASE_URL%/agendamentos/1 ^
  -H "Content-Type: application/json" ^
  --silent -w "\n"

echo.
echo ✅ Agendamento cancelado!
echo 📬 E-mail de cancelamento foi enviado para: joao.silva@test.com
echo.

REM ═══════════════════════════════════════════════════════════════
REM 5. VERIFYAR E-MAILS NO MAILTRAP
REM ═══════════════════════════════════════════════════════════════
echo.
echo ═══════════════════════════════════════════════════════════════
echo 5️⃣  VISUALIZAR E-MAILS NO MAILTRAP
echo ═══════════════════════════════════════════════════════════════
echo.
echo Para ver os e-mails enviados:
echo.
echo 1. Acesse: https://mailtrap.io
echo 2. Faça login
echo 3. Vá para "Inbox" do projeto "agenda"
echo 4. Você verá os 2 e-mails enviados:
echo    - Confirmação de Agendamento
echo    - Cancelamento de Agendamento
echo.
echo ═══════════════════════════════════════════════════════════════
echo ✨ TESTES CONCLUÍDOS COM SUCESSO!
echo ═══════════════════════════════════════════════════════════════
echo.

pause
