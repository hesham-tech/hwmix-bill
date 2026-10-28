param(
  [Parameter(Mandatory=$true)][string]$P2WorkerPath,
  [string]$NsisPath,
  [string]$TiMiniPath,
  [string]$NodePath,
  [string]$WebViewSdkDirectory,
  [string]$WebViewBootstrapper
)
$ErrorActionPreference = 'Stop'
$bridgeRoot = Split-Path -Parent $PSScriptRoot
$projectRoot = [IO.Path]::GetFullPath((Join-Path $bridgeRoot '..\..'))
$buildRoot = Join-Path $bridgeRoot '.build'
$vendorRoot = Join-Path $buildRoot 'vendor'
$releaseRoot = Join-Path $bridgeRoot 'release'
$payloadRoot = Join-Path $buildRoot ('payload-' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $vendorRoot, $releaseRoot, $payloadRoot -Force | Out-Null

function Get-VerifiedFile([string]$Uri, [string]$Path, [string]$Sha256) {
  if (!(Test-Path -LiteralPath $Path)) { Invoke-WebRequest -Uri $Uri -OutFile $Path }
  if ((Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant() -ne $Sha256.ToLowerInvariant()) { throw ('SHA256 mismatch: ' + $Path) }
}

# Pinned inputs make the installer reproducible without using a customer's runtime.
if (!$NodePath) {
  $NodePath = Join-Path $vendorRoot 'node-v24.22.1.exe'
  Get-VerifiedFile 'https://nodejs.org/dist/v24.22.1/win-x64/node.exe' $NodePath 'd702daa815eabbff763c7d3808e235cf031cf2ca70211b56847bc72f51e240e5'
}
if (!$TiMiniPath) {
  $TiMiniPath = Join-Path $vendorRoot 'TiMini-Print-Command-Line-Windows-x86_64.exe'
  Get-VerifiedFile 'https://github.com/Dejniel/TiMini-Print/releases/download/v0.9/TiMini-Print-Command-Line-Windows-x86_64.exe' $TiMiniPath '96208ac2829bee126e511007e8bc5af06b26d3bcb39a6a903dd9f3654acdd4ec'
}
if ((Get-FileHash -LiteralPath $NodePath -Algorithm SHA256).Hash.ToLowerInvariant() -ne 'd702daa815eabbff763c7d3808e235cf031cf2ca70211b56847bc72f51e240e5') { throw 'Unexpected Node runtime. Update the pinned runtime and its license together.' }
if ((Get-FileHash -LiteralPath $TiMiniPath -Algorithm SHA256).Hash.ToLowerInvariant() -ne '96208ac2829bee126e511007e8bc5af06b26d3bcb39a6a903dd9f3654acdd4ec') { throw 'Unexpected TiMini binary.' }
if (!$NsisPath) {
  $nsisZip = Join-Path $vendorRoot 'nsis-3.13.zip'
  Get-VerifiedFile 'https://github.com/tauri-apps/binary-releases/releases/download/nsis-3.13/nsis-3.13.zip' $nsisZip 'ba63dffc4410ee89193e1cb5a41989991bd77c61068da17e3156d136b7b0b3d8'
  $nsisRoot = Join-Path $vendorRoot 'nsis'
  Expand-Archive -LiteralPath $nsisZip -DestinationPath $nsisRoot -Force
  $NsisPath = (Get-ChildItem -LiteralPath $nsisRoot -Filter makensis.exe -Recurse | Where-Object { $_.Directory.Name -ne 'Bin' } | Select-Object -First 1).FullName
}

# WebView2 SDK is bundled; Evergreen Runtime is installed only when missing.
if (!$WebViewSdkDirectory) {
  $sdkZip = Join-Path $vendorRoot 'webview2-1.0.4314.35.zip'
  Get-VerifiedFile 'https://api.nuget.org/v3-flatcontainer/microsoft.web.webview2/1.0.4314.35/microsoft.web.webview2.1.0.4314.35.nupkg' $sdkZip '90778deb1b77e36292828b4b5833c9255c27533f40e0ddd55891ae718944edc4'
  $WebViewSdkDirectory = Join-Path $vendorRoot 'webview2-sdk'
  Expand-Archive -LiteralPath $sdkZip -DestinationPath $WebViewSdkDirectory -Force
}
if (!$WebViewBootstrapper) {
  $WebViewBootstrapper = Join-Path $vendorRoot 'MicrosoftEdgeWebView2Setup.exe'
  if (!(Test-Path -LiteralPath $WebViewBootstrapper)) { Invoke-WebRequest 'https://go.microsoft.com/fwlink/p/?LinkId=2124703' -OutFile $WebViewBootstrapper }
}
$runtimeSignature = Get-AuthenticodeSignature -LiteralPath $WebViewBootstrapper
if ($runtimeSignature.Status -ne 'Valid' -or $runtimeSignature.SignerCertificate.Subject -notmatch 'O=Microsoft Corporation') { throw 'WebView2 bootstrapper must be signed by Microsoft.' }

$runtimeBridge = Join-Path $payloadRoot 'resources\bridge'
$runtimeTiMini = Join-Path $payloadRoot 'resources\timini'
$runtimeP2 = Join-Path $payloadRoot 'resources\p2-worker'
New-Item -ItemType Directory -Path $runtimeP2 -Force | Out-Null
Copy-Item -LiteralPath $P2WorkerPath -Destination (Join-Path $runtimeP2 'HWNiXP2Worker.exe')
$licenses = Join-Path $payloadRoot 'licenses'
New-Item -ItemType Directory -Path $runtimeBridge, $runtimeTiMini, $licenses, (Join-Path $runtimeBridge 'desktop') -Force | Out-Null
Copy-Item -LiteralPath $NodePath -Destination (Join-Path $payloadRoot 'resources\node.exe')
Copy-Item -LiteralPath $TiMiniPath -Destination (Join-Path $runtimeTiMini 'TiMini-Print-Command-Line-Windows-x86_64.exe')
& $P2WorkerPath --licenses | Set-Content -LiteralPath (Join-Path $licenses 'P2-Worker-LICENSES.txt') -Encoding utf8
if ($LASTEXITCODE -ne 0) { throw 'P2 worker license verification failed.' }
# Explicit allowlist: never package local configs, pairing tokens, logs or job PDFs.
foreach ($file in @('server.mjs', 'desktop.mjs', 'desktop-config.mjs', 'documents.mjs', 'printer-readiness.mjs', 'printer-profiles.mjs')) { Copy-Item -LiteralPath (Join-Path $bridgeRoot $file) -Destination (Join-Path $runtimeBridge $file) }
foreach ($file in @('admin.html', 'admin.js', 'admin.css', 'editor.js', 'editor-schema.mjs')) { Copy-Item -LiteralPath (Join-Path $PSScriptRoot $file) -Destination (Join-Path $runtimeBridge 'desktop') }
$sdkLib = Join-Path $WebViewSdkDirectory 'lib\net462'
foreach ($assembly in @('Microsoft.Web.WebView2.Core.dll', 'Microsoft.Web.WebView2.WinForms.dll')) { Copy-Item -LiteralPath (Join-Path $sdkLib $assembly) -Destination $payloadRoot }
Copy-Item -LiteralPath (Join-Path $WebViewSdkDirectory 'runtimes\win-x64\native\WebView2Loader.dll') -Destination $payloadRoot
Copy-Item -LiteralPath $WebViewBootstrapper -Destination (Join-Path $payloadRoot 'resources\MicrosoftEdgeWebView2Setup.exe')
Copy-Item -LiteralPath (Join-Path $WebViewSdkDirectory 'LICENSE.txt') -Destination (Join-Path $licenses 'WebView2-SDK-LICENSE.txt')
Copy-Item -LiteralPath (Join-Path $WebViewSdkDirectory 'NOTICE.txt') -Destination (Join-Path $licenses 'WebView2-SDK-NOTICE.txt')
& $NodePath (Join-Path $PSScriptRoot 'build-ui.mjs') (Join-Path $runtimeBridge 'desktop\vendor')
if ($LASTEXITCODE -ne 0) { throw 'Unable to bundle desktop UI.' }
Copy-Item -LiteralPath (Join-Path $runtimeBridge 'desktop\vendor\UI-THIRD-PARTY-LICENSES.txt') -Destination $licenses
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'دليل الاستخدام.txt') -Destination (Join-Path $payloadRoot 'دليل الاستخدام.txt')
$nodeLicense = Join-Path $vendorRoot 'Node-v24.22.1-LICENSE.txt'
if (!(Test-Path -LiteralPath $nodeLicense)) { Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/nodejs/node/v24.22.1/LICENSE' -OutFile $nodeLicense }
Copy-Item -LiteralPath $nodeLicense -Destination (Join-Path $licenses 'Node.js-LICENSE.txt')
$nsisLicense = Join-Path (Split-Path -Parent $NsisPath) 'COPYING'
if (Test-Path -LiteralPath $nsisLicense) { Copy-Item -LiteralPath $nsisLicense -Destination (Join-Path $licenses 'NSIS-LICENSE.txt') }
$notices = @'
HWNiX Print Bridge 1.1.4

This distribution contains third-party software. Each component retains its own license.

Node.js v24.22.1 (MIT and bundled third-party licenses): see Node.js-LICENSE.txt.
Source: https://github.com/nodejs/node/tree/v24.22.1

TiMini-Print Community v0.9 (Apache License 2.0 and bundled third-party licenses):
see TiMini-Print-LICENSES.txt for the complete license and notice texts, including bundled Python components.
Source: https://github.com/Dejniel/TiMini-Print
The original TiMini executable is distributed unmodified. It is not affiliated with HWNiX.
HWNiXP2Worker is a separate HWNiX wrapper around TiMini v0.9: native Windows SPP service
resolution and a 12-second passive connection hold after successful sending.
Wrapper source: tools/timini-bridge/desktop/worker. See P2-Worker-LICENSES.txt.

Installer generated using NSIS 3.13 (zlib/libpng license and included component licenses).
Source: https://nsis.sourceforge.io/

The WebView2 SDK (Microsoft) is bundled under its included LICENSE and NOTICE.
The signed Evergreen Runtime bootstrapper installs WebView2 only when missing.
The desktop UI bundles PDF.js, jsPDF, JsBarcode and QRCode; see UI-THIRD-PARTY-LICENSES.txt.
Windows/.NET Framework components are provided by the operating system and are not bundled here.
'@
Set-Content -LiteralPath (Join-Path $licenses 'THIRD-PARTY-NOTICES.txt') -Value $notices -Encoding utf8
& $NodePath (Join-Path $PSScriptRoot 'build-catalog.mjs') $TiMiniPath $payloadRoot
if ($LASTEXITCODE -ne 0) { throw 'Unable to build model catalog/licenses.' }
$compiler = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
& $compiler /nologo /target:winexe /platform:x64 /optimize+ /codepage:65001 /reference:System.Windows.Forms.dll /reference:System.Drawing.dll /reference:System.Web.Extensions.dll ('/reference:' + (Join-Path $sdkLib 'Microsoft.Web.WebView2.Core.dll')) ('/reference:' + (Join-Path $sdkLib 'Microsoft.Web.WebView2.WinForms.dll')) ('/out:' + (Join-Path $payloadRoot 'HWNiXPrintBridge.exe')) (Join-Path $PSScriptRoot 'Launcher.cs')
if ($LASTEXITCODE -ne 0) { throw 'Native launcher compilation failed.' }
& $NsisPath ('/DPAYLOAD=' + $payloadRoot) ('/DOUTPUT=' + $releaseRoot) (Join-Path $PSScriptRoot 'installer.nsi')
if ($LASTEXITCODE -ne 0) { throw 'Windows installer compilation failed.' }
$installer = Join-Path $releaseRoot 'HWNiX-Print-Bridge-Setup-1.1.4.exe'
$downloadRoot = Join-Path $projectRoot 'public\downloads'
New-Item -ItemType Directory -Path $downloadRoot -Force | Out-Null
Copy-Item -LiteralPath $installer -Destination $downloadRoot
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'دليل الاستخدام.txt') -Destination $releaseRoot
$hash = (Get-FileHash -LiteralPath $installer -Algorithm SHA256).Hash.ToLowerInvariant()
Set-Content -LiteralPath (Join-Path $releaseRoot 'SHA256SUMS.txt') -Value ($hash + '  ' + [IO.Path]::GetFileName($installer)) -Encoding ascii
Set-Content -LiteralPath (Join-Path $buildRoot 'latest-payload.txt') -Value $payloadRoot -Encoding utf8
Write-Output ('Installer: ' + $installer)
Write-Output ('SHA256: ' + $hash)
