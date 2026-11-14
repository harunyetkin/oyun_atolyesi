@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ==== Oyun Atolyesi .exe olusturuluyor ====
echo.

set PY=
where python >nul 2>nul && set PY=python
if not defined PY ( where py >nul 2>nul && set PY=py )
if not defined PY (
  echo Python bulunamadi. python.org adresinden Python kurup tekrar deneyin.
  pause
  exit /b 1
)

%PY% -m pip install --upgrade --prefer-binary pywebview pyinstaller
if errorlevel 1 (
  echo.
  echo Paketler kurulamadi. Yukaridaki hata mesajini Claude'a gonderin.
  pause
  exit /b 1
)

%PY% -m PyInstaller --noconfirm --onefile --windowed --name OyunAtolyesi --add-data "app;app" atolye.py
if exist dist\OyunAtolyesi.exe (
  copy /y dist\OyunAtolyesi.exe OyunAtolyesi.exe >nul
  rmdir /s /q build >nul 2>nul
  rmdir /s /q dist >nul 2>nul
  del /q OyunAtolyesi.spec >nul 2>nul
  echo.
  echo Tamam! OyunAtolyesi.exe bu klasorde. Cift tiklayip acabilirsiniz.
) else (
  echo.
  echo .exe olusturulamadi. Yukaridaki hata mesajini Claude'a gonderin.
)
pause
