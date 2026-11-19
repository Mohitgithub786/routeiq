@echo off
title Enterprise Multi-Agent MCP Router
echo ==============================================================
echo   Starting Enterprise Multi-Agent MCP Router...
echo   Open your browser to: http://localhost:8000
echo ==============================================================
python -m uvicorn app.main:app --reload
pause
