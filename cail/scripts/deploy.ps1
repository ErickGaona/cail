# Script para deploy manual de las Cloud Functions
# Útil para el primer deploy o para pruebas

param(
    [Parameter()]
    [ValidateSet("usuarios", "ofertas", "matching", "all")]
    [string]$Function = "all",
    
    [switch]$DryRun
)

$PROJECT_ID = "cail-backend-prod"
$REGION = "us-central1"

Write-Host "🚀 Deploy de Microservicios CAIL" -ForegroundColor Cyan
Write-Host "   Proyecto: $PROJECT_ID" -ForegroundColor Gray
Write-Host "   Región: $REGION" -ForegroundColor Gray
Write-Host ""

# Verificar gcloud
if (!(Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: gcloud CLI no está instalado" -ForegroundColor Red
    exit 1
}

# Configurar proyecto
gcloud config set project $PROJECT_ID

function Deploy-Function {
    param($name, $port)
    
    Write-Host "📦 Desplegando función: $name" -ForegroundColor Yellow
    
    $sourcePath = "functions/$name"
    
    if ($DryRun) {
        Write-Host "   [DryRun] gcloud functions deploy $name --gen2 --runtime=nodejs20 --region=$REGION" -ForegroundColor Gray
        return
    }
    
    # Build primero
    Write-Host "   Building..." -ForegroundColor Gray
    Push-Location $sourcePath
    npm run build
    Pop-Location
    
    # Deploy
    Write-Host "   Deploying to Cloud Functions..." -ForegroundColor Gray
    gcloud functions deploy $name `
        --gen2 `
        --runtime=nodejs20 `
        --region=$REGION `
        --source=$sourcePath `
        --entry-point=$name `
        --trigger-http `
        --allow-unauthenticated `
        --memory=256MB `
        --timeout=60s `
        --set-env-vars="NODE_ENV=production,PORT=$port" `
        --set-secrets="FIREBASE_PROJECT_ID=FIREBASE_PROJECT_ID:latest,FIREBASE_CLIENT_EMAIL=FIREBASE_CLIENT_EMAIL:latest,FIREBASE_PRIVATE_KEY=FIREBASE_PRIVATE_KEY:latest,JWT_SECRET=JWT_SECRET:latest"
    
    if ($name -eq "usuarios") {
        # Usuarios también necesita RESEND_API_KEY
        gcloud functions deploy $name `
            --update-secrets="RESEND_API_KEY=RESEND_API_KEY:latest" `
            --region=$REGION
    }
    
    # Obtener URL
    $url = gcloud functions describe $name --region=$REGION --format='value(serviceConfig.uri)'
    Write-Host "   ✅ Desplegado: $url" -ForegroundColor Green
}

# Build shared library primero
Write-Host "📚 Building librería compartida..." -ForegroundColor Cyan
Push-Location "shared/cail-common"
npm ci
npm run build
Pop-Location

# Deploy funciones
switch ($Function) {
    "usuarios" { Deploy-Function "usuarios" 8080 }
    "ofertas" { Deploy-Function "ofertas" 8083 }
    "matching" { Deploy-Function "matching" 8084 }
    "all" {
        Deploy-Function "usuarios" 8080
        Deploy-Function "ofertas" 8083
        Deploy-Function "matching" 8084
    }
}

Write-Host ""
Write-Host "✅ Deploy completado!" -ForegroundColor Green
Write-Host ""
Write-Host "URLs de las funciones:" -ForegroundColor Cyan
gcloud functions list --filter="name~usuarios OR name~ofertas OR name~matching" --format="table(name,state,httpsTrigger.url)"
