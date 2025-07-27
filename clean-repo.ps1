# clean-repo.ps1 - cleans old mirrored repo and clones fresh

# Change to your project directory
Set-Location "D:\Projects\Asim Agro React Project\project"

# Delete old mirrored repo folder if it exists
if (Test-Path "Asim--Agro-Res-Lim.git") {
    Write-Host "Removing old mirrored repo folder..."
    Remove-Item -Recurse -Force "Asim--Agro-Res-Lim.git"
} else {
    Write-Host "No old mirrored repo folder found, continuing..."
}

# Clone the repo as a mirror
Write-Host "Cloning the repo as a mirror..."
git clone --mirror https://github.com/KSD-333/Asim--Agro-Res-Lim.git

Write-Host "Done! Now navigate into the folder and run BFG commands to clean .env."
Write-Host "Example:"
Write-Host "cd Asim--Agro-Res-Lim.git"
Write-Host "java -jar path\\to\\bfg-1.14.0.jar --delete-files .env"
Write-Host "git reflog expire --expire=now --all"
Write-Host "git gc --prune=now --aggressive"
Write-Host "git push --force"
