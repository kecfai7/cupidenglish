@echo off
echo Starting Cupid English AI Studio...
cd /d "%~dp0"
start http://localhost:5173/
npm run dev
