# Enhanced Manual Upload Script for Project Library
# Usage: 
#   Single project: .\upload-manual.ps1 -FilePath "path\to\your\project.json"
#   Batch upload: .\upload-manual.ps1 -FilePath "path\to\your\projects.json" -BatchMode
#   Multiple files: .\upload-manual.ps1 -FilePath "path1.json,path2.json,path3.json" -MultipleFiles

param(
    [Parameter(Mandatory=$true)]
    [string]$FilePath,
    
    [string]$AdminKey = "ai4kandy",
    [string]$BackendUrl = "http://localhost:3000",
    [switch]$BatchMode,
    [switch]$MultipleFiles,
    [switch]$Verbose
)

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Test-JsonFile {
    param([string]$Path)
    
    try {
        $content = Get-Content -Path $Path -Raw
        $json = $content | ConvertFrom-Json
        
        # Check if it's an array (batch mode) or object (single project)
        if ($json -is [array]) {
            return "batch"
        } elseif ($json -is [object]) {
            return "single"
        } else {
            return "invalid"
        }
    } catch {
        return "invalid"
    }
}

function Upload-SingleProject {
    param([string]$Path)
    
    Write-ColorOutput "Uploading single project: $Path" "Green"
    
    # Read and validate JSON
    $jsonContent = Get-Content -Path $Path -Raw
    $jsonType = Test-JsonFile -Path $Path
    
    if ($jsonType -eq "invalid") {
        Write-ColorOutput "Error: Invalid JSON file - $Path" "Red"
        return $false
    }
    
    if ($jsonType -eq "batch") {
        Write-ColorOutput "Warning: File contains array of projects. Use -BatchMode for batch upload." "Yellow"
    }
    
    # Try JSON upload first
    try {
        $headers = @{
            "Content-Type" = "application/json"
            "x-admin-key" = $AdminKey
        }
        
        if ($Verbose) {
            Write-ColorOutput "Sending JSON data to $BackendUrl/projects/import-json" "Yellow"
        }
        
        $response = Invoke-RestMethod -Uri "$BackendUrl/projects/import-json" -Method POST -Headers $headers -Body $jsonContent
        
        Write-ColorOutput "JSON upload successful!" "Green"
        Write-ColorOutput "Project: $($response.project.title) (Slug: $($response.project.slug))" "Cyan"
        return $true
        
    } catch {
        Write-ColorOutput "JSON upload failed: $($_.Exception.Message)" "Red"
        
        # Try file upload method as fallback
        Write-ColorOutput "Trying file upload method as fallback..." "Yellow"
        
        try {
            $form = @{
                file = Get-Item -Path $Path
            }
            
            $headers = @{
                "x-admin-key" = $AdminKey
            }
            
            $response = Invoke-RestMethod -Uri "$BackendUrl/projects/import" -Method POST -Headers $headers -Form $form
            
            Write-ColorOutput "File upload successful!" "Green"
            Write-ColorOutput "Project: $($response.project.title) (Slug: $($response.project.slug))" "Cyan"
            return $true
            
        } catch {
            Write-ColorOutput "File upload also failed: $($_.Exception.Message)" "Red"
            return $false
        }
    }
}

function Upload-BatchProjects {
    param([string]$Path)
    
    Write-ColorOutput "Uploading batch projects: $Path" "Green"
    
    # Validate JSON
    $jsonType = Test-JsonFile -Path $Path
    if ($jsonType -ne "batch") {
        Write-ColorOutput "Error: File must contain an array of projects for batch upload" "Red"
        return $false
    }
    
    try {
        $form = @{
            file = Get-Item -Path $Path
        }
        
        $headers = @{
            "x-admin-key" = $AdminKey
        }
        
        if ($Verbose) {
            Write-ColorOutput "Sending batch file to $BackendUrl/projects/import-batch" "Yellow"
        }
        
        $response = Invoke-RestMethod -Uri "$BackendUrl/projects/import-batch" -Method POST -Headers $headers -Form $form
        
        Write-ColorOutput "Batch upload completed!" "Green"
        Write-ColorOutput "Summary: $($response.summary.successful) successful, $($response.summary.failed) failed out of $($response.summary.total) total" "Cyan"
        
        if ($response.summary.failed -gt 0) {
            Write-ColorOutput "Failed uploads:" "Red"
            foreach ($failure in $response.results.failed) {
                Write-ColorOutput "  Item $($failure.index + 1): $($failure.error)" "Red"
            }
        }
        
        if ($response.summary.successful -gt 0) {
            Write-ColorOutput "Successful uploads:" "Green"
            foreach ($success in $response.results.successful) {
                Write-ColorOutput "  Item $($success.index + 1): $($success.project.title) (Slug: $($success.project.slug))" "Green"
            }
        }
        
        return $true
        
    } catch {
        Write-ColorOutput "Batch upload failed: $($_.Exception.Message)" "Red"
        return $false
    }
}

# Main execution
Write-ColorOutput "=== Project Library Upload Script ===" "Cyan"
Write-ColorOutput "Backend URL: $BackendUrl" "White"
Write-ColorOutput "Admin Key: $AdminKey" "White"

if ($MultipleFiles) {
    # Handle multiple files
    $files = $FilePath -split ','
    $successCount = 0
    $totalCount = $files.Count
    
    Write-ColorOutput "Processing $totalCount files..." "Yellow"
    
    foreach ($file in $files) {
        $file = $file.Trim()
        if (Test-Path $file) {
            if (Upload-SingleProject -Path $file) {
                $successCount++
            }
        } else {
            Write-ColorOutput "File not found: $file" "Red"
        }
    }
    
    Write-ColorOutput "Completed: $successCount/$totalCount files uploaded successfully" "Cyan"
    
} elseif ($BatchMode) {
    # Handle batch upload
    if (Test-Path $FilePath) {
        Upload-BatchProjects -Path $FilePath
    } else {
        Write-ColorOutput "File not found: $FilePath" "Red"
    }
    
} else {
    # Handle single file
    if (Test-Path $FilePath) {
        Upload-SingleProject -Path $FilePath
    } else {
        Write-ColorOutput "File not found: $FilePath" "Red"
    }
}

Write-ColorOutput "=== Upload Script Complete ===" "Cyan"
