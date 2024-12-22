let score = 0;
let incorrectAnswers = 0;
let feedBack = "";
let testStarted = false;
let testCount = 0;
const MAX_TESTS = 20;
let currentCorrectAnswer = false; // Track if a dot is actually shown

document.addEventListener('DOMContentLoaded', function() {
    const okButton = document.getElementById('okButton');
    const testArea = document.getElementById('test-area');
    const testControls = document.getElementById('test-controls');
    const goBackButton = document.getElementById('GoBack');
    const dotContainer = document.getElementById('dot-container');
    const optionsContainer = document.getElementById('options-container');

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

        modal.innerHTML = `
            <div style="background-color: white; padding: 20px; border-radius: 10px; text-align: center; max-width: 300px;">
                <h2>Are you sure?</h2>
                <p>If you leave now, your current test progress will be lost.</p>
                <div style="display: flex; justify-content: space-between; margin-top: 20px;">
                    <button id="confirm-navigation" style="padding: 10px 20px; background-color: #5cb85c; color: white; border: none; border-radius: 5px; cursor: pointer;">Yes, Leave</button>
                    <button id="cancel-navigation" style="padding: 10px 20px; background-color: #d9534f; color: white; border: none; border-radius: 5px; cursor: pointer;">Cancel</button>
                </div>
            </div>
        `;
        return modal;
    }

    okButton.addEventListener('click', function() {
        testControls.style.display = 'none';
        testArea.style.display = 'block';
        document.getElementById('instructions').style.display = 'none';
        document.getElementById('title').textContent = 'Watch The Dot Test';
        startTest();
        testStarted = true;
        window.addEventListener('beforeunload', confirmNavigation);
    });

    goBackButton.addEventListener('click', function() {
        if (testStarted) {
            const modal = createNavigationConfirmationModal();
            document.body.appendChild(modal);

            document.getElementById('confirm-navigation').addEventListener('click', () => {
                window.removeEventListener('beforeunload', confirmNavigation);
                window.location.href = 'allTests';
            });

            document.getElementById('cancel-navigation').addEventListener('click', () => {
                document.body.removeChild(modal);
            });
        } else {
            window.location.href = 'allTests';
        }
    });

    function confirmNavigation(event) {
        if (testStarted) {
            event.preventDefault();
            event.returnValue = '';
        }
    }

    function generateRandomPosition() {
        const angle = Math.random() * Math.PI * 2;
        const radius = 150;
        return {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius
        };
    }

    function showDot() {
        // Clear previous content
        dotContainer.innerHTML = `
            <div id="test-area-container" style="position: relative; width: 400px; height: 400px; background-color: #f5f5f5; border-radius: 10px;">
                <div id="center-dot" style="position: absolute; width: 10px; height: 10px; background-color: black; border-radius: 50%; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
            </div>
        `;

        // Randomly decide whether to show a peripheral dot (70% chance)
        currentCorrectAnswer = Math.random() < 0.7;

        if (currentCorrectAnswer) {
            const pos = generateRandomPosition();
            const peripheralDot = document.createElement('div');
            peripheralDot.id = 'peripheral-dot';
            peripheralDot.style.cssText = `
                position: absolute;
                width: 8px;
                height: 8px;
                background-color: red;
                border-radius: 50%;
                top: 50%;
                left: 50%;
                transform: translate(${pos.x}px, ${pos.y}px);
                opacity: 0;
                transition: opacity 0.2s;
            `;
            document.querySelector('#test-area-container').appendChild(peripheralDot);

            setTimeout(() => {
                peripheralDot.style.opacity = '1';
            }, 500);
        }

        // Always show response buttons
        setTimeout(() => {
            optionsContainer.innerHTML = `
                <div style="margin-top: 20px; text-align: center;">
                    <p style="margin-bottom: 10px;">Did you see a red dot?</p>
                    <button onclick="handleAnswer(true)" class="option-button">Yes</button>
                    <button onclick="handleAnswer(false)" class="option-button">No</button>
                </div>
            `;
        }, 1000);
    }
    

    function startTest() {
        testCount = 0;
        showNextTest();
    }

    function showNextTest() {
        optionsContainer.innerHTML = '';
        if (testCount < MAX_TESTS) {
            showDot();
        } else {
            completeTest();
        }
    }

    window.handleAnswer = function(sawDot) {
        const isCorrect = sawDot === currentCorrectAnswer;
        if (isCorrect) {
            score++;
        } else {
            incorrectAnswers++;
        }

        testCount++;
        if (testCount < MAX_TESTS) {
            showNextTest();
        } else {
            completeTest();
        }
    };

    function determineFeedback(finalScore) {
        const percentage = (finalScore / MAX_TESTS) * 100;
        if (percentage >= 90) {
            feedBack = "Excellent peripheral vision! Your visual field appears to be functioning very well.";
            return feedBack;
        }
        if (percentage >= 75) {
            feedBack = "Good peripheral vision. Regular check-ups recommended.";
            return feedBack;
        }
        if (percentage >= 60) {
            feedBack = "Moderate peripheral vision. Consider consulting an eye care professional.";
            return feedBack;
        }
        feedBack = "Your peripheral vision might need attention. Please consult an eye care professional.";
        return feedBack;
    }

    function completeTest() {
        const feedbackMsg = determineFeedback(score);
        testArea.innerHTML = `
            <div style="text-align: center;">
                <h2>Test Complete!</h2>
                <p>Your score: ${score}/${MAX_TESTS}</p>
                <p>${feedbackMsg}</p>
                <button onclick="saveAndReturn()" style="margin-top: 20px;">OK</button>
            </div>
        `;
    }

    window.saveAndReturn = function() {
        window.removeEventListener('beforeunload', confirmNavigation);
        
        testArea.innerHTML = `
            <div style="text-align: center;">
                <h2>Saving results...</h2>
            </div>
        `;

        saveResults();
        
        setTimeout(() => {
            window.location.href = 'allTests';
        }, 2000);
    };

    function saveResults() {
        fetch('/Watch_Dot_save_results', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                score: score,
                incorrectAnswers: incorrectAnswers,
                feedback: feedBack
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                console.error('Failed to save results');
            }
        })
        .catch(error => console.error('Error:', error));
    }
});