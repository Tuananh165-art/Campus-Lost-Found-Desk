$ErrorActionPreference = 'Stop'
$workspacePath = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $workspacePath
New-Item -ItemType Directory -Force -Path 'evidence' | Out-Null
$tasks = @('typecheck', 'lint', 'test', 'export:all')
foreach ($task in $tasks) {
    $logName = $task.Replace(':', '-')
    $ErrorActionPreference = 'Continue' # Native stderr warnings are evidence, not failed exit statuses.
    & npm.cmd run $task 2>&1 | Tee-Object -FilePath "evidence/$logName.txt"
    $ErrorActionPreference = 'Stop'
    if ($LASTEXITCODE -ne 0) { throw "Verification failed: $task (exit $LASTEXITCODE)" }
}
Write-Output 'All four verification commands passed.'
