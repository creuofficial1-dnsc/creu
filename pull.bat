@echo off
REM Git Pull Batch File for Creu Website
cd /d "c:\Users\Administrator\Desktop\kuan\creu"
echo Pulling latest changes from GitHub...
git pull --allow-unrelated-histories origin main
echo Pull completed!
pause
