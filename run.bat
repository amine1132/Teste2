@echo off
echo.
echo === Site Amoureux ===
echo.
echo Choisissez une option :
echo 1. Demarrer le serveur de developpement
echo 2. Construire le projet
echo 3. Ouvrir dans le navigateur
echo 4. Quitter
echo.
set /p choice=Votre choix (1-4): 

if "%choice%"=="1" (
    echo Demarrage du serveur...
    npm run dev
) else if "%choice%"=="2" (
    echo Construction du projet...
    npm run build
) else if "%choice%"=="3" (
    echo Ouverture du site...
    start http://localhost:3000
) else if "%choice%"=="4" (
    echo Au revoir !
    exit
) else (
    echo Choix invalide !
    pause
    goto :eof
)

pause
