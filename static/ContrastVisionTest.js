let currentLevel = 1;
let score = 0;
let consecutiveWrong = 0;
let feedBack = "";
let testStarted = false;

document.addEventListener("DOMContentLoaded", function () {
  const okButton = document.getElementById("okButton");
  const testArea = document.getElementById("test-area");
  const testControls = document.getElementById("test-controls");
  const goBackButton = document.getElementById("GoBack");
  const contrastPattern = document.getElementById("contrast-pattern");
  const optionsContainer = document.getElementById("options-container");

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
    //document.getElementById("instructions").style.display = "none";
    document.getElementById("instructions").innerText =
      "Identify which side has the darker pattern!";
    document.getElementById("instructions").style.cssText = `
        text-align: center; 
        font-weight: bold;
        font-size: 20px;
        `;
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

  function generateContrastPattern() {
    // Adjust the maximum square  to 253
    const maxSquareColor = 250;
    const squareColor = Math.min(
      maxSquareColor,
      Math.floor(maxSquareColor * (currentLevel / 17))
    ); // Square gets lighter up to 253
    const backgroundColor = 255; // Background stays white

    const isLeft = Math.random() > 0.5; // Randomly position the square on the left or right

    contrastPattern.innerHTML = `
            <div style="position: relative; width: 300px; height: 300px; background-color: rgb(${backgroundColor}, ${backgroundColor}, ${backgroundColor}); margin: 20px auto; border: 1px solid #ccc;">
                <div style="position: absolute; top: 25%; ${isLeft ? "left: 0" : "right: 0"
      }; 
                    width: 50%; height: 50%; background-color: rgb(${squareColor}, ${squareColor}, ${squareColor});">
                </div>
            </div>
            <p style="text-align: center; margin-top: 10px;">Level ${currentLevel}/17</p>
        `;

    optionsContainer.innerHTML = `
            <button onclick="handleAnswer('left')" class="option-button">Left Side</button>
            <button onclick="handleAnswer('right')" class="option-button">Right Side</button>
        `;

    return isLeft ? "left" : "right";
  }

  let currentCorrectAnswer = "";

  function startTest() {
    currentCorrectAnswer = generateContrastPattern();
  }

  window.handleAnswer = function (response) {
    if (response === currentCorrectAnswer) {
      score = currentLevel; // Update score to current level
      consecutiveWrong = 0; // Reset consecutive wrong answers

      if (currentLevel < 17) {
        currentLevel++;
        currentCorrectAnswer = generateContrastPattern();
      } else if (currentLevel == 17) {
        completeTest();
      }
    } else {
      consecutiveWrong++;

      if (consecutiveWrong >= 2) {
        // Two wrong answers - end test with current score
        completeTest();
      } else {
        // First wrong answer - go back one level
        currentLevel = Math.max(1, currentLevel - 1);
        currentCorrectAnswer = generateContrastPattern();
      }
    }
  };

  function determineFeedback(finalScore) {
    if (finalScore >= 15) {
      feedBack = "Excellent contrast sensitivity!";
      return feedBack;
    }
    if (finalScore >= 12) {
      feedBack = "Good contrast sensitivity. Regular check-ups recommended.";
      return feedBack;
    }
    if (finalScore >= 8) {
      feedBack =
        "Moderate contrast sensitivity. Consider consulting an eye care professional.";
      return feedBack;
    }
    feedBack =
      "Your contrast sensitivity might need attention. Please consult an eye care professional.";
    return feedBack;
  }

  function completeTest() {
    // Hide the instruction elements
    const title = document.getElementById('title');
    const instructions = document.getElementById('instructions');
    if (title) title.style.display = 'none';
    if (instructions) instructions.style.display = 'none';

    const feedbackMsg = determineFeedback(score);
    testArea.innerHTML = `
            <style>
                .option-button {
                    margin-top: 20px;
                    padding: 10px 20px;
                    background-color: #5cb85c;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                }
    
                .option-button:hover {
                    background-color: #4cae4c;
                }
    
                .option-button:active {
                    background-color: #3d8b40;
                    transform: scale(0.95);
                }
            </style>
            <div style="text-align: center;">
                <h2>Test Complete!</h2>
                <p>Your score: ${score}/17</p>
                <p>${feedbackMsg}</p>
                <button onclick="saveAndReturn()" class="option-button">OK</button>
            </div>
        `;
  }

  window.saveAndReturn = async function () {
    try {
      window.removeEventListener("beforeunload", confirmNavigation);

      // Show saving message
      testArea.innerHTML = `
                <div style="text-align: center;">
                    <h2>Saving results...</h2>
                </div>
            `;

      // Save results with await
      const response = await fetch("/Contrast_Vision_save_results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          score: score,
          incorrectAnswers: consecutiveWrong,
          feedback: feedBack,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error("Failed to save results");
      }

      // Immediate redirect after successful save
      window.location.href = "allTests";
    } catch (error) {
      console.error("Error saving results:", error);
      // Show error message to user
      testArea.innerHTML = `
                <div style="text-align: center;">
                    <h2>Error saving results</h2>
                    <p>Please try again</p>
                    <button onclick="saveAndReturn()" class="option-button">Retry</button>
                    <button onclick="window.location.href='allTests'" class="option-button">Return without saving</button>
                </div>
            `;
    }
  };
});
