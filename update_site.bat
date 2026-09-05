@echo off
chcp 65001 >nul
title تحديث منظومة بلغوا عني ولو آية
echo ==========================================
echo    أداة تحديث المنظومة (Al-Fatiha Updater)
echo ==========================================
echo.

REM --- تحديث كاش المنظومة تلقائياً (PWA) ---
if exist bump.js (
  node bump.js 2>nul
)

echo 1. جاري فحص التغييرات...
git add .

echo.
set /p commit_msg="ماذا قمت بتعديله؟ (وصف مختصر أو اضغط Enter): "

if "%commit_msg%"=="" set commit_msg="تحديث عام ومتابعة دورية"

echo.
echo 2. جاري حفظ التعديلات محلياً...
git commit -m "%commit_msg%"

echo.
echo 3. جاري الرفع إلى GitHub...
:: ضبط الحساب تلقائياً لمنع ظهور نافذة اختيار الحسابات
git config credential.https://github.com.username Akram-akl
git push origin main

echo.
echo ==========================================
echo ✅ تم التحديث بنجاح!
echo سيقوم الموقع بالتحديث تلقائياً خلال ثوانٍ.
echo ==========================================
pause
