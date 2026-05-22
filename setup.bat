@echo off
REM Git Setup - Initialize repository and set remote
echo Initializing git repository...
cd /d "c:\Users\Administrator\Desktop\kuan\creu"
git init
git remote add origin https://github.com/WesleyDn143/creu.git
git config user.email "wesleydn143@example.com"
git config user.name "Wesley"
echo.
echo Repository initialized!
echo Remote URL set to: https://github.com/WesleyDn143/creu
echo.
pause
