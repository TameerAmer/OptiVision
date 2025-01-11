let currentLevel = 1;
let score = 0;
let incorrectAnswers = 0;
let feedBack = "";
let testStarted = false;
const MAX_LEVELS = 5;
let currentNumber = "";

document.addEventListener("DOMContentLoaded", function () {
  const okButton = document.getElementById("okButton");
  const testArea = document.getElementById("test-area");
  const testControls = document.getElementById("test-controls");
  const goBackButton = document.getElementById("GoBack");
  const blurText = document.getElementById("blur-text");

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

  okButton.addEventListener("click", function () {
    testControls.style.display = "none";
    testArea.style.display = "block";
    document.getElementById("title").textContent = "Blur Check Test";
    startTest();
    testStarted = true;
    window.addEventListener("beforeunload", confirmNavigation);
  });

  goBackButton.addEventListener("click", function () {
    if (testStarted) {
      const modal = createNavigationConfirmationModal();
      document.body.appendChild(modal);

      document
        .getElementById("confirm-navigation")
        .addEventListener("click", () => {
          window.removeEventListener("beforeunload", confirmNavigation);
          window.location.href = "allTests";
        });

      document
        .getElementById("cancel-navigation")
        .addEventListener("click", () => {
          document.body.removeChild(modal);
        });
    } else {
      window.location.href = "allTests";
    }
  });

  function confirmNavigation(event) {
    if (testStarted) {
      event.preventDefault();
      event.returnValue = "";
    }
  }

  function generateRandomNumber() {
    return Math.floor(Math.random() * 900) + 100; // 3-digit number
  }

  function showBlurText() {
    currentNumber = generateRandomNumber().toString();
    const blurAmount = currentLevel * 0.9;

    blurText.innerHTML = `
          <div style="text-align: center;">
              <p style="font-size: 48px; filter: blur(${blurAmount}px); margin: 20px 0; font-family: monospace;">
                  ${currentNumber}
              </p>
              <input type="number" id="userInput" style="padding: 8px; margin: 10px; border-radius: 4px; border: 1px solid #ccc; font-size: 24px; width: 150px; text-align: center;">
              <button onclick="checkAnswer()" style="padding: 8px 16px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">Submit</button>
              <p style="margin-top: 10px;">Level ${currentLevel}</p>
          </div>
      `;

    // Get input element once
    const userInput = document.getElementById("userInput");
    if (userInput) {
      // Set focus
      userInput.focus();
      // Add enter key listener
      userInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
          checkAnswer();
        }
      });
    }
  }

  function startTest() {
    showBlurText();
  }

  window.checkAnswer = function () {
    const userInput = document.getElementById("userInput").value;
    const correctAnswer = currentNumber;

    if (userInput === correctAnswer) {
      // Show success message
      const successMsg = document.createElement("p");
      successMsg.style.color = "green";
      successMsg.textContent = "Correct!";
      document.getElementById("userInput").parentNode.appendChild(successMsg);

      // Increment score
      score++;

      // Move to next number after delay
      setTimeout(() => {
        currentLevel++;
        showBlurText();
      }, 1000);
    } else {
      // Just show the next number without incrementing score
      currentLevel++;
      incorrectAnswers++;
      showBlurText();
    }

    // Check if test should end
    if (currentLevel >= MAX_LEVELS) {
      completeTest();
    }
  };

  function determineFeedback(finalScore) {
    if (finalScore >= 4) {
      feedBack =
        "Excellent vision clarity! Your ability to see blurred numbers is very good.";
      return feedBack;
    }
    if (finalScore >= 3) {
      feedBack = "Good vision clarity. Regular check-ups recommended.";
      return feedBack;
    }
    if (finalScore >= 2) {
      feedBack =
        "Moderate vision clarity. Consider consulting an eye care professional.";
      return feedBack;
    }
    feedBack =
      "You might be experiencing vision clarity issues. Please consult an eye care professional.";
    return feedBack;
  }

  function completeTest() {
    document.getElementById("instructions").style.display = "none";
    const feedbackMsg = determineFeedback(score);
    testArea.innerHTML = `
            <style>
                #okButton, #ok-button {
                    margin-top: 20px;
                    padding: 10px 20px;
                    background-color: #5cb85c;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                }
    
                #okButton:hover, #ok-button:hover {
                    background-color: #4cae4c;
                }
    
                #okButton:active, #ok-button:active {
                    background-color: #3d8b40;
                    transform: scale(0.95);
                }
            </style>
            <div style="text-align: center;">
                <h2>Test Complete!</h2>
                <p>Your score: ${score}/${MAX_LEVELS}</p>
                <p>${feedbackMsg}</p>
                <button id="okButton" onclick="saveAndReturn()">OK</button>
            </div>
        `;
  }

  window.saveAndReturn = function () {
    window.removeEventListener("beforeunload", confirmNavigation);

    testArea.innerHTML = `
            <div style="text-align: center;">
                <h2>Saving results...</h2>
            </div>
        `;

    saveResults();

    setTimeout(() => {
      window.location.href = "allTests";
    }, 2000);
  };

  function saveResults() {
    fetch("/Blur_Check_save_results", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        score: score,
        incorrectAnswers: incorrectAnswers,
        feedback: feedBack,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.success) {
          console.error("Failed to save results");
        }
      })
      .catch((error) => console.error("Error:", error));
  }
});
