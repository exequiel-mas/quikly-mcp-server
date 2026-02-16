# Wrapper for Windows: run quikly-mcp-server with env vars from system or mcp.json
# Usage in mcp.json: "command": "powershell", "args": ["-ExecutionPolicy", "Bypass", "-File", "path/to/quikly-mcp-server/scripts/run-quikly-mcp.ps1"]
$env:QUIKLY_API_BASE_URL = "https://api.getquikly.com/api/external/v1"
$env:QUIKLY_API_KEY = $env:QUIKLY_API_KEY
if (-not $env:QUIKLY_API_KEY) {
  [Console]::Error.WriteLine("ERROR: QUIKLY_API_KEY not set. Set it in system env or in mcp.json")
  exit 1
}
& npx -y quikly-mcp-server
