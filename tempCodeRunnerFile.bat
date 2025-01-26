:: use this bat file to commit and publish changes to github
:: to run use .\run_git.bat
@echo off
setlocal

:: Get the current date in 'dd-mm-yy' format
for /f "tokens=1-3 delims=/" %%a in ("%date%") do (
    set "day=%%a"
    set "month=%%b"
    set "year=%%c"
)

:: Formatted date
set "formattedDate=%day%-%month%-%year:~-2%"

:: Run Git commands
::%formattedDate%     To Set the date as a message
git status
git add .
git commit -m "Help Icon added"
git push -u origin main

endlocal