@echo off
REM Git Push Batch File for Creu Website
cd /d "%~dp0"
echo Pushing changes to GitHub...
git add .
git commit -m "Update website"
git push origin main
echo Push completed!
pause
