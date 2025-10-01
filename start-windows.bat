@echo off
echo Starting SHIVAKESHAVA ELECTRONICS Service Management System...
echo.
echo Checking if .env file exists...

if not exist .env (
    echo.
    echo ❌ ERROR: .env file not found!
    echo.
    echo Please create .env file first:
    echo 1. Copy .env.example to .env
    echo 2. Update DATABASE_URL with your MySQL credentials
    echo.
    echo Example for XAMPP:
    echo DATABASE_URL="mysql://root:@localhost:3306/shivakeshava_electronics"
    echo.
    pause
    exit /b 1
)

echo ✅ .env file found
echo Setting environment variables...
set NODE_ENV=development

echo Starting application...
tsx server/index.ts

pause