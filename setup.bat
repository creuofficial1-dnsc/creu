@echo off
REM Git Setup - Initialize repository and set remote
echo Initializing git repository...
cd /d "c:\Users\Administrator\Desktop\kuan\creu"
git init
git remote add origin https://github.com/WesleyDn143/creu.git
git config user.email "wesleydn143@example.com"
git config user.name "Wesley"
echo.
echo Adding files and making initial commit...
git add .
git commit -m "Initial commit: Upload Creu website"
echo.
echo Pushing to GitHub (first time)...
git push -u origin main
echo.
echo Repository initialized and pushed to GitHub!
echo Remote URL: https://github.com/WesleyDn143/creu
echo.
pause
