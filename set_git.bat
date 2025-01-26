:: This batch file updates the Capstone-Project repository with new changes.
@echo off

:: Add all changes (including new files/directories)
git add .

:: Commit the changes with a meaningful message
git commit -m "Add Phase B directory with updates"

:: Push changes to the remote repository
git push origin main

@echo Git update complete!
pause
