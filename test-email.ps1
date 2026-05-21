# Script para testar o envio de e-mails da API

$baseUrl = "http://localhost:8080/api"

# 1. Criar um cliente
Write-Host "📧 Teste de Envio de E-mail - Agenda" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1️⃣  Criando cliente..." -ForegroundColor Yellow

$cliente = @{
    nome = "João Silva"
    email = "joao.silva@example.com"
    telefone = "(11) 99999-8888"
} | ConvertTo-Json

$clienteResponse = Invoke-WebRequest -Uri "$baseUrl/clientes" `
    -Method POST `
    -Body $cliente `
    -ContentType "application/json" `
    -SkipHttpErrorCheck

$clienteData = $clienteResponse.Content | ConvertFrom-Json
$clienteId = $clienteData.id

Write-Host "✅ Cliente criado com ID: $clienteId" -ForegroundColor Green
Write-Host ""

# 2. Criar agendamento (dispara envio de confirmação)
Write-Host "2️⃣  Criando agendamento (dispara e-mail de confirmação)..." -ForegroundColor Yellow

$agendamento = @{
    cliente = @{ id = $clienteId }
    dataHora = "2026-05-25T14:30:00"
    descricao = "Consulta de rotina"
    status = "AGENDADO"
} | ConvertTo-Json

$agendamentoResponse = Invoke-WebRequest -Uri "$baseUrl/agendamentos" `
    -Method POST `
    -Body $agendamento `
    -ContentType "application/json" `
    -SkipHttpErrorCheck

$agendamentoData = $agendamentoResponse.Content | ConvertFrom-Json
$agendamentoId = $agendamentoData.id

Write-Host "✅ Agendamento criado com ID: $agendamentoId" -ForegroundColor Green
Write-Host "📬 E-mail de confirmação enviado para: $($clienteData.email)" -ForegroundColor Green
Write-Host ""

# 3. Cancelar agendamento (dispara envio de cancelamento)
Write-Host "3️⃣  Cancelando agendamento (dispara e-mail de cancelamento)..." -ForegroundColor Yellow

$cancelResponse = Invoke-WebRequest -Uri "$baseUrl/agendamentos/$agendamentoId" `
    -Method DELETE `
    -SkipHttpErrorCheck

Write-Host "✅ Agendamento cancelado" -ForegroundColor Green
Write-Host "📬 E-mail de cancelamento enviado para: $($clienteData.email)" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✨ Testes concluídos com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Dicas:" -ForegroundColor Cyan
Write-Host "- Verifique os e-mails em: https://mailtrap.io" -ForegroundColor Gray
Write-Host "- Username: 28b5860d372855" -ForegroundColor Gray
Write-Host "- As credenciais estão em: src/main/resources/application.properties" -ForegroundColor Gray
