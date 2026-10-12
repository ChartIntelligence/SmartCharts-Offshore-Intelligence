param(
  [Parameter(Mandatory=$true)][string]$WorktreeRoot,
  [string]$RepositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path,
  [string]$CodexExecutable = 'codex'
)
$ErrorActionPreference = 'Stop'
$controlArea = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$localArea = Join-Path $controlArea '.local'
$settingsPath = Join-Path $localArea 'settings.json'
if (Test-Path -LiteralPath $settingsPath) { throw 'Existing settings preserved; edit explicitly rather than rerunning bootstrap.' }
$repositoryPath = (Resolve-Path -LiteralPath $RepositoryRoot).Path
$expectedBaseline = '10150d5a8187e4ba52f62c0c747d919b30345b7d'
$kind = & git -C $repositoryPath cat-file -t $expectedBaseline
if ($LASTEXITCODE -ne 0 -or $kind -ne 'commit') { throw 'Exact baseline unavailable.' }
$taskRootPath = [System.IO.Path]::GetFullPath($WorktreeRoot)
if ($taskRootPath -eq $repositoryPath -or $taskRootPath -eq [System.IO.Path]::GetPathRoot($taskRootPath)) { throw 'A dedicated task-worktree directory is required.' }
New-Item -ItemType Directory -Force -Path $localArea,$taskRootPath | Out-Null
$settings = [ordered]@{
  repositoryRoot = $repositoryPath
  worktreeRoot = $taskRootPath
  statusDirectory = (Join-Path $localArea 'state')
  codexExecutable = $CodexExecutable
  localExecutionEnabled = $false
}
$settings | ConvertTo-Json | Set-Content -LiteralPath $settingsPath -Encoding utf8
Write-Output "Prepared disabled local controller: $settingsPath"
Write-Output 'Follow docs/WINDOWS_ACTIVATION.md before enabling execution. No task or service started.'
