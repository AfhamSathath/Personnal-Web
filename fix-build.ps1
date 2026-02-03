
Set-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)

if (-not (Test-Path package.json)) { Write-Error "package.json not found"; exit 1 }

Try {
    $json = Get-Content package.json -Raw | ConvertFrom-Json
} Catch {
    Write-Error "Failed to read package.json"
    exit 1
}

# Ensure dependency sections exist
if (-not $json.dependencies) { $json.dependencies = @{} }
if (-not $json.devDependencies) { $json.devDependencies = @{} }

$changed = $false

# Align react + react-dom to a compatible version (use 18.2.0 for react-scripts@5)
$targetReact = "^18.2.0"
if ($json.dependencies.react -and $json.dependencies.react -ne $targetReact) {
    $json.dependencies.react = $targetReact; $changed = $true
} elseif ($json.devDependencies.react -and $json.devDependencies.react -ne $targetReact) {
    $json.devDependencies.react = $targetReact; $changed = $true
} elseif (-not $json.dependencies.react -and -not $json.devDependencies.react) {
    $json.dependencies.react = $targetReact; $changed = $true
}

if ($json.dependencies.'react-dom' -and $json.dependencies.'react-dom' -ne $targetReact) {
    $json.dependencies.'react-dom' = $targetReact; $changed = $true
} elseif ($json.devDependencies.'react-dom' -and $json.devDependencies.'react-dom' -ne $targetReact) {
    $json.devDependencies.'react-dom' = $targetReact; $changed = $true
} elseif (-not $json.dependencies.'react-dom' -and -not $json.devDependencies.'react-dom') {
    $json.dependencies.'react-dom' = $targetReact; $changed = $true
}

# Ensure react-scripts present (recommended for CRA)
$targetScripts = "5.0.1"
if (-not ($json.dependencies.'react-scripts' -or $json.devDependencies.'react-scripts')) {
    $json.devDependencies.'react-scripts' = $targetScripts
    $changed = $true
} elseif ($json.dependencies.'react-scripts' -and $json.dependencies.'react-scripts' -ne $targetScripts) {
    $json.dependencies.'react-scripts' = $targetScripts; $changed = $true
} elseif ($json.devDependencies.'react-scripts' -and $json.devDependencies.'react-scripts' -ne $targetScripts) {
    $json.devDependencies.'react-scripts' = $targetScripts; $changed = $true
}

if ($changed) {
    $json | ConvertTo-Json -Depth 20 | Set-Content package.json -Encoding UTF8
    Write-Host "Updated package.json (react/react-dom/react-scripts)."
}

# Clean and install
if (Test-Path node_modules) {
    Write-Host "Removing node_modules..."
    Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue
}
if (Test-Path package-lock.json) {
    Write-Host "Removing package-lock.json..."
    Remove-Item package-lock.json -Force -ErrorAction SilentlyContinue
}

Write-Host "Running npm install..."
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Warning "npm install failed. Retrying with --legacy-peer-deps..."
    npm install --legacy-peer-deps
    if ($LASTEXITCODE -ne 0) {
        Write-Error "npm install --legacy-peer-deps failed. Resolve dependency issues manually."
        exit $LASTEXITCODE
    }
}

Write-Host "Running npm run build..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed. Try: npm run build after resolving errors or use: npm install --legacy-peer-deps then npm run build"
    exit $LASTEXITCODE
}

Write-Host "Build completed successfully."
