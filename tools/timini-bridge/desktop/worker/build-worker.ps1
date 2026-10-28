param(
  [Parameter(Mandatory=$true)][string]$PythonPath,
  [Parameter(Mandatory=$true)][string]$TiMiniSourceDirectory,
  [Parameter(Mandatory=$true)][string]$OutputDirectory
)
$ErrorActionPreference='Stop'
$sourceRoot=[IO.Path]::GetFullPath($TiMiniSourceDirectory)
$outputRoot=[IO.Path]::GetFullPath($OutputDirectory)
if (!(Test-Path -LiteralPath (Join-Path $sourceRoot 'timiniprint\app\cli.py'))) { throw 'TiMini v0.9 sources are required.' }
# Build in a dedicated Python 3.12 Windows environment; never a customer machine.
& $PythonPath (Join-Path $sourceRoot 'tools\build_license_text.py') --output (Join-Path $sourceRoot 'timiniprint\data\THIRD_PARTY_LICENSES.txt')
if ($LASTEXITCODE -ne 0) { throw 'Unable to collect dependency licenses.' }
& $PythonPath -m PyInstaller --noconfirm --onefile --paths $sourceRoot --add-data ((Join-Path $sourceRoot 'timiniprint\data')+';timiniprint/data') --distpath $outputRoot --workpath (Join-Path $outputRoot 'work') --specpath $outputRoot --collect-all bleak --collect-all pypdfium2 --collect-all pypdfium2_raw --exclude-module tkinter --exclude-module matplotlib --exclude-module pandas --exclude-module scipy --name HWNiXP2Worker (Join-Path $PSScriptRoot 'p2_worker.py')
if ($LASTEXITCODE -ne 0) { throw 'P2 worker build failed.' }
& (Join-Path $outputRoot 'HWNiXP2Worker.exe') --list-models | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'P2 worker catalog verification failed.' }
