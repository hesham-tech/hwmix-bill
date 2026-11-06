[CmdletBinding()]
param(
    [string]$ApiRoot = 'D:\Dev\projects\hwnix-bill-api',
    [string]$PhpBinary = 'C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe',
    [string]$OutputDirectory = (Join-Path ([IO.Path]::GetTempPath()) ('hwnix-release-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))),
    [int]$PreviewPort = 5174
)
$ErrorActionPreference = 'Stop'
$frontRoot = Split-Path $PSScriptRoot -Parent
$ApiRoot = (Resolve-Path -LiteralPath $ApiRoot).Path
$PhpBinary = (Resolve-Path -LiteralPath $PhpBinary).Path
$OutputDirectory = [IO.Path]::GetFullPath($OutputDirectory)
foreach ($sourceRoot in @($frontRoot,$ApiRoot)) {
    if ($OutputDirectory.Equals($sourceRoot,[StringComparison]::OrdinalIgnoreCase) -or
        $OutputDirectory.StartsWith($sourceRoot.TrimEnd('\','/') + [IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)) {
        throw 'Keep release evidence outside both source repositories.'
    }
}
if ((Test-Path -LiteralPath $OutputDirectory) -and (Get-ChildItem -LiteralPath $OutputDirectory -Force | Select-Object -First 1)) {
    throw 'Use a new, empty output directory; existing evidence will not be overwritten.'
}
New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null

function Invoke-ReleaseCheck([string]$Name, [string]$Directory, [scriptblock]$Action) {
    Push-Location -LiteralPath $Directory
    try {
        Write-Host "Checking $Name"
        & $Action 2>&1 | Tee-Object -FilePath (Join-Path $OutputDirectory "$Name.log")
        if ($LASTEXITCODE -ne 0) { throw "$Name failed with exit code $LASTEXITCODE. See the log; no release approval was issued." }
    } finally { Pop-Location }
}

$savedEnvironment = @{}
$isolatedEnvironment = @{
    APP_ENV='testing'; DB_CONNECTION='sqlite'; DB_DATABASE=':memory:';
    CACHE_STORE='array'; MAIL_MAILER='array'; QUEUE_CONNECTION='sync';
    E2E_PREVIEW='1'; E2E_BASE_URL="http://localhost:$PreviewPort"
}
try {
    foreach ($key in $isolatedEnvironment.Keys) {
        $savedEnvironment[$key] = [Environment]::GetEnvironmentVariable($key,'Process')
        [Environment]::SetEnvironmentVariable($key,$isolatedEnvironment[$key],'Process')
    }
    Invoke-ReleaseCheck 'api-tests' $ApiRoot {
        $files = @(Get-ChildItem tests/Feature/Store*Test.php | Where-Object Name -ne 'StoreMysqlConcurrencyTest.php' | ForEach-Object FullName)
        $files += @('tests/Feature/ErpScheduledNotificationTest.php','tests/Feature/PaymentDriverSecurityTest.php',
            'tests/Feature/KashierDriverTest.php','tests/Feature/PaymentControllerTest.php',
            'tests/Feature/SaaSPricingTest.php','tests/Feature/SaaSSubscriptionTest.php',
            'tests/Feature/OwnerFundTransactionTest.php','tests/Feature/InstallmentPaymentControllerTest.php',
            'tests/Feature/DebugStoreTest.php','tests/Unit/StoreMoneyAndSignatureTest.php','tests/Unit/ShippingFinancialsTest.php')
        $files += @(Get-ChildItem Modules/Notification/tests/Feature/*Test.php | ForEach-Object FullName)
        & $PhpBinary vendor/bin/phpunit @files
    }
    Invoke-ReleaseCheck 'unit-tests' $frontRoot { & npm.cmd test }
    Invoke-ReleaseCheck 'production-build' $frontRoot { & npm.cmd run build }
    Invoke-ReleaseCheck 'browser-tests' $frontRoot { & npx.cmd playwright test tests/e2e/store }
    Invoke-ReleaseCheck 'api-diff' $ApiRoot { & git diff --check }
    Invoke-ReleaseCheck 'front-diff' $frontRoot { & git diff --check }

    # Only public frontend build files are packaged. Never include .env, uploads,
    # deployment workflows, SSH keys, database dumps, or backend runtime data.
    $archive = Join-Path $OutputDirectory 'store-frontend.zip'
    $privateBuildFiles = @(Get-ChildItem -LiteralPath (Join-Path $frontRoot 'dist') -File -Recurse -Force | Where-Object {
        $_.Name -like '.env*' -or $_.Name -in @('id_rsa','id_ed25519') -or $_.Extension -in @('.pem','.key','.pfx','.sql')
    })
    if ($privateBuildFiles.Count) { throw 'Unexpected private files in frontend build; packaging stopped.' }
    Compress-Archive -Path (Join-Path $frontRoot 'dist/*') -DestinationPath $archive
    $manifest = [ordered]@{
        created_at_utc = [DateTime]::UtcNow.ToString('o')
        scope = 'local_code_candidate'; production_approved = $false; real_payments = 'deferred'
        frontend_archive_sha256 = (Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash
        frontend_lock_sha256 = (Get-FileHash -LiteralPath (Join-Path $frontRoot 'package-lock.json') -Algorithm SHA256).Hash
        backend_lock_sha256 = (Get-FileHash -LiteralPath (Join-Path $ApiRoot 'composer.lock') -Algorithm SHA256).Hash
        limitations = @('External production configuration and provider validation are separate.',
            'MySQL concurrency verification is separate; this script only uses SQLite in memory.',
            'Frontend archive is not a backend deployment package.',
            'Dependency risk assessment remains required; audits are not suppressed by this script.')
    }
    $manifest | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $OutputDirectory 'manifest.json') -Encoding utf8
    Write-Host "Local checks passed. Evidence: $OutputDirectory. Production remains unapproved."
} finally {
    foreach ($key in $savedEnvironment.Keys) {
        [Environment]::SetEnvironmentVariable($key,$savedEnvironment[$key],'Process')
    }
}
