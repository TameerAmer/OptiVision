// Global Variables
let currentEye = 'right'; // Tracks the current eye being tested ('right' or 'left')
let rightEyeResult = null; // Stores the result of the test for the right eye
let leftEyeResult = null; // Stores the result of the test for the left eye
let feedBack = ""; // Stores feedback message based on the test results
let testStarted = false; // Tracks whether the test has started to prevent accidental navigation

// Wait for the DOM to load before executing the script
document.addEventListener("DOMContentLoaded", function () {
    // References to important DOM elements
    const okButton = document.getElementById("okButton"); // Start button
    const testArea = document.getElementById("test-area"); // Area for rendering the test
    const testControls = document.getElementById("test-controls"); // Test control buttons
    const goBackButton = document.getElementById("GoBack"); // Go back button
    const gridContainer = document.getElementById("dot-container"); // Grid container
    const optionsContainer = document.getElementById("options-container"); // Options container

    /**
     * Creates a modal for navigation confirmation.
     * @returns {HTMLElement} - The modal element.
     */
    function createNavigationConfirmationModal() {
        const modal = document.createElement("div");
        modal.id = "navigation-confirmation-modal";
        modal.style.position = "fixed";
        modal.style.top = "0";
        modal.style.left = "0";
        modal.style.width = "100%";
        modal.style.height = "100%";
        modal.style.backgroundColor = "rgba(0,0,0,0.5)";
        modal.style.display = "flex";
        modal.style.justifyContent = "center";
        modal.style.alignItems = "center";
        modal.style.zIndex = "1000";

        // Modal content
        modal.innerHTML = `
            <div style="background-color: white; padding: 20px; border-radius: 10px; text-align: center; max-width: 300px;">
                <h2>Are you sure?</h2>
                <p>If you leave now, your test progress will be lost.</p>
                <div style="display: flex; justify-content: space-between; margin-top: 20px;">
                    <button id="confirm-navigation" style="padding: 10px 20px; background-color: #5cb85c; color: white; border: none; border-radius: 5px; cursor: pointer;">Yes, Leave</button>
                    <button id="cancel-navigation" style="padding: 10px 20px; background-color: #d9534f; color: white; border: none; border-radius: 5px; cursor: pointer;">Cancel</button>
                </div>
            </div>
        `;
        return modal;
    }

    /**
     * Starts the test for the right eye.
     */
    okButton.addEventListener("click", function () {
        testControls.style.display = "none";
        testArea.style.display = "block";
        document.getElementById("title").textContent = "Amsler Grid Test - Right Eye";
        startTest();
        testStarted = true;

        // Add a listener to confirm navigation if the user tries to leave
        window.addEventListener("beforeunload", confirmNavigation);
    });

    /**
     * Creates the Amsler Grid for the test.
     * @returns {string} - The HTML structure of the grid.
     */
    function createAmslerGrid() {
        const gridSize = 400; // Size of the grid in pixels
        const gridHTML = `
            <div style="position: relative; width: ${gridSize}px; height: ${gridSize}px; background-color: white; border: 1px solid black;">
                <svg width="${gridSize}" height="${gridSize}">
                    ${createGridLines(gridSize)}
                    <circle cx="${gridSize / 2}" cy="${gridSize / 2}" r="4" fill="black"/> <!-- Central dot -->
                </svg>
            </div>
            <div style="text-align: center; margin-top: 20px;">
                <h3>Testing ${currentEye.charAt(0).toUpperCase() + currentEye.slice(1)} Eye</h3>
                <p>Cover your ${currentEye === 'right' ? 'left' : 'right'} eye and focus on the central dot.</p>
                <p>Do all lines and squares appear equal and regular?</p>
            </div>
        `;
        return gridHTML;
    }

    /**
     * Creates grid lines for the Amsler Grid.
     * @param {number} size - The size of the grid in pixels.
     * @returns {string} - The SVG lines for the grid.
     */
    function createGridLines(size) {
        let lines = '';
        const spacing = size / 20; // Grid spacing for a 20x20 grid

        // Vertical lines
        for (let i = spacing; i < size; i += spacing) {
            lines += `<line x1="${i}" y1="0" x2="${i}" y2="${size}" stroke="black" stroke-width="1"/>`;
        }

        // Horizontal lines
        for (let i = spacing; i < size; i += spacing) {
            lines += `<line x1="0" y1="${i}" x2="${size}" y2="${i}" stroke="black" stroke-width="1"/>`;
        }

        return lines;
    }

    /**
     * Renders the Amsler Grid and answer options.
     */
    function showGrid() {
        gridContainer.innerHTML = createAmslerGrid();
        optionsContainer.innerHTML = `
            <div style="margin-top: 20px; text-align: center;">
                <button onclick="handleAnswer(true)" class="option-button">Yes</button>
                <button onclick="handleAnswer(false)" class="option-button">No</button>
            </div>
        `;
    }

    /**
     * Starts the test for the first eye (right).
     */
    function startTest() {
        currentEye = 'right';
        title.style.display = "block";
        instructions.style.display = "block";
        showGrid();
    }

    /**
     * Handles user response (Yes/No).
     * @param {boolean} isRegular - Whether the grid appears regular to the user.
     */
    window.handleAnswer = function (isRegular) {
        if (currentEye === 'right') {
            rightEyeResult = isRegular;
            currentEye = 'left';
            document.getElementById("title").textContent = "Amsler Grid Test - Left Eye";
            showGrid();
        } else {
            leftEyeResult = isRegular;
            completeTest();
        }
    };

    /**
     * Determines feedback based on the results of both eyes.
     * @param {boolean} rightEyeResult - Result of the right eye test.
     * @param {boolean} leftEyeResult - Result of the left eye test.
     * @returns {string} - Feedback message.
     */
    function determineFeedback(rightEyeResult, leftEyeResult) {
        if (rightEyeResult && leftEyeResult) {
            return "Great! Your vision appears normal in both eyes. Continue regular check-ups with your eye care professional.";
        } else if (!rightEyeResult && !leftEyeResult) {
            return "Both eyes showed irregular patterns. Please consult an eye care professional for a comprehensive examination.";
        } else {
            const affectedEye = !rightEyeResult ? "right" : "left";
            return `Your ${affectedEye} eye showed irregular patterns. It's recommended to consult an eye care professional for further evaluation.`;
        }
    }

    /**
     * Completes the test and displays the results.
     */
    function completeTest() {
        feedBack = determineFeedback(rightEyeResult, leftEyeResult);
        // Clear the test area content and hide instructions
        title.style.display = "none";
        instructions.style.display = "none";

        testArea.innerHTML = `
            <div style="text-align: center;">
                <h2>Test Complete!</h2>
                <p>Right Eye: ${rightEyeResult ? "Regular pattern" : "Irregular pattern"}</p>
                <p>Left Eye: ${leftEyeResult ? "Regular pattern" : "Irregular pattern"}</p>
                <p>${feedBack}</p>
                <button id="okButton" onclick="saveAndReturn()">OK</button>
            </div>
        `;
    }

    /**
     * Saves results and navigates back to the main page.
     */
    window.saveAndReturn = function () {
        window.removeEventListener("beforeunload", confirmNavigation);
        saveResults();
        setTimeout(() => {
            window.location.href = "allTests";
        }, 2000);
    };

    /**
     * Sends test results to the server.
     */
    function saveResults() {
        fetch("/Watch_Dot_save_results", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                score: (rightEyeResult ? 1 : 0) + (leftEyeResult ? 1 : 0),
                incorrectAnswers: 2 - ((rightEyeResult ? 1 : 0) + (leftEyeResult ? 1 : 0)),
                feedback: feedBack
            }),
        }).catch(error => console.error("Error:", error));
    }

    /**
     * Handles the Go Back button functionality.
     */
    goBackButton.addEventListener("click", function () {
        if (testStarted) {
            const modal = createNavigationConfirmationModal();
            document.body.appendChild(modal);

            document.getElementById("confirm-navigation").addEventListener("click", function () {
                window.removeEventListener("beforeunload", confirmNavigation);
                window.location.href = "allTests";
            });

            document.getElementById("cancel-navigation").addEventListener("click", function () {
                document.body.removeChild(modal);
            });
        } else {
            window.location.href = "allTests";
        }
    });

    /**
     * Displays a confirmation prompt when attempting to navigate away.
     * @param {Event} e - The unload event.
     */
    function confirmNavigation(e) {
        const message = "Are you sure you want to leave? Your test progress will be lost.";
        e.preventDefault();
        e.returnValue = message;
        return message;
    }
});
