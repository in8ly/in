@echo off
echo Building in8ly school digital garden...

REM Set the paths
set OBSIDIAN_VAULT=C:\Users\in8ly\ObsidianVaults\in_8_ly
set QUARTZ_DIR=C:\Users\in8ly\in8ly-garden

REM Copy content from Obsidian to Quartz content folder
echo Copying content from Obsidian vault...
if not exist "%QUARTZ_DIR%\content" mkdir "%QUARTZ_DIR%\content"

REM Clear existing content (except _index.md if it exists)
if exist "%QUARTZ_DIR%\content\_index.md" (
    move "%QUARTZ_DIR%\content\_index.md" "%QUARTZ_DIR%\_index_temp.md" >nul 2>&1
)
rd /s /q "%QUARTZ_DIR%\content" 2>nul
mkdir "%QUARTZ_DIR%\content"
if exist "%QUARTZ_DIR%\_index_temp.md" (
    move "%QUARTZ_DIR%\_index_temp.md" "%QUARTZ_DIR%\content\_index.md" >nul 2>&1
)

REM Copy all markdown files from Obsidian, excluding .obsidian and other hidden folders
xcopy "%OBSIDIAN_VAULT%\*.md" "%QUARTZ_DIR%\content\" /s /e /y /exclude:%QUARTZ_DIR%\exclude.txt 2>nul

REM Copy any attachments (images, etc)
if exist "%OBSIDIAN_VAULT%\attachments" (
    xcopy "%OBSIDIAN_VAULT%\attachments\*" "%QUARTZ_DIR%\content\attachments\" /s /e /y 2>nul
)

REM Navigate to Quartz directory
cd /d "%QUARTZ_DIR%"

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Build the site
echo Building Quartz site...
npx quartz build

echo.
echo Build complete! Your site is in the 'public' folder.
echo To preview locally, run: npx quartz build --serve
pause