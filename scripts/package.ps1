$ErrorActionPreference = 'Stop'
$workspacePath = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $workspacePath
$archiveName = '1923051085_HoangMinhTuanAnh_MidTermLab_104.zip'
$archivePath = Join-Path $workspacePath $archiveName
# An allowlist prevents node_modules, credentials, build caches and old ZIPs being included.
$entries = @('app', 'assets', 'components', 'config', 'data', 'hooks', 'providers', 'services', 'store', 'theme', 'tests', 'scripts', 'evidence', 'screenshots',
    'package.json', 'package-lock.json', 'tsconfig.json', 'app.json', 'eslint.config.js', 'playwright.config.ts',
    '.gitignore', 'README.md', 'ANSWERS.md', 'AI_LOG.md', 'LICENSE', 'MidTermLab_Code104_Campus_Lost_Found_5h_STUDENT.docx')
foreach ($entry in $entries) { if (!(Test-Path -LiteralPath (Join-Path $workspacePath $entry))) { throw "Missing required entry: $entry" } }
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression
$stream = [IO.File]::Open($archivePath, [IO.FileMode]::Create)
$zip = New-Object IO.Compression.ZipArchive($stream, [IO.Compression.ZipArchiveMode]::Create)
try {
    foreach ($entry in $entries) {
        $path = Join-Path $workspacePath $entry
        $files = if (Test-Path -LiteralPath $path -PathType Container) { Get-ChildItem -LiteralPath $path -Recurse -File } else { Get-Item -LiteralPath $path }
        foreach ($file in $files) {
            if ($file.Name -like 'package*.txt') { continue } # A caller may be streaming the package log.
            $relative = $file.FullName.Substring($workspacePath.Length + 1).Replace('\', '/')
            [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file.FullName, $relative, [IO.Compression.CompressionLevel]::Optimal) | Out-Null
        }
    }
} finally { $zip.Dispose(); $stream.Dispose() }
$check = [IO.Compression.ZipFile]::OpenRead($archivePath)
try {
    if ($check.Entries.FullName -match '(^|/)(node_modules|\.expo|dist|\.env)(/|$)') { throw 'Excluded directory present in archive' }
    foreach ($required in @('package.json', 'package-lock.json', 'AI_LOG.md', 'ANSWERS.md', 'app/items/[id].tsx')) {
        if ($null -eq $check.GetEntry($required)) { throw "Archive missing $required" }
    }
    Write-Output "Verified $($check.Entries.Count) files in $archiveName"
} finally { $check.Dispose() }
Get-FileHash -LiteralPath $archivePath -Algorithm SHA256
