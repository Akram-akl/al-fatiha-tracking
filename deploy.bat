@echo off
setlocal EnableDelayedExpansion

echo ========================================================
echo       Preparing update for GitHub...
echo ========================================================
echo.

REM --- Auto-bump cache version in sw.js ---
set "SW_FILE=sw.js"
set "TIMESTAMP=%DATE:~10,4%%DATE:~4,2%%DATE:~7,2%_%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%"
set "TIMESTAMP=!TIMESTAMP: =0!"
set "NEW_VERSION=al-fatiha-v!TIMESTAMP!"

powershell -Command "(Get-Content '%SW_FILE%') -replace 'const CACHE_VERSION = \"[^\"]*\"', 'const CACHE_VERSION = \"!NEW_VERSION!\"' | Set-Content '%SW_FILE%'"
echo [OK] Cache version bumped to: !NEW_VERSION!
echo.

REM --- Stage all changes ---
git add .

REM --- Commit message ---
set "msg="
set /p msg="Enter commit message (or press Enter for default): "
if not defined msg set "msg=Update !NEW_VERSION!"

git commit -m "%msg%"
echo.
echo Uploading to GitHub...
git push origin main

echo.
echo ========================================================
echo    Done! Updates will appear live within 1-2 minutes.
echo ========================================================
pause
endlocal
