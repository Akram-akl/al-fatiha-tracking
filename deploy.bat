@echo off
setlocal
echo ========================================================
echo       Checking and preparing files for GitHub...
echo ========================================================
echo.

git add .

set "msg="
set /p msg="Enter commit message (or press Enter for default): "
if not defined msg set "msg=Update: %date% %time%"

git commit -m "%msg%"
echo.
echo Uploading to server...
git push origin main

echo.
echo ========================================================
echo       Upload Completed Successfully!
echo ========================================================
pause
endlocal
