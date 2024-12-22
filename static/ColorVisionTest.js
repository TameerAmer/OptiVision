let currentTest = 0;
let score = 0;
let incorrectAnswers = 0;
let feedBack = "";

const startButton = document.getElementById("okButton");
const goBackButton = document.getElementById("GoBack");
const testArea = document.getElementById("test-area");
const testImage = document.getElementById("test-image");
const optionsContainer = document.getElementById("options-container");
const feedback = document.getElementById("feedback");
const instructions = document.getElementById("instructions");

// Flag to track if the test has started
let testStarted = false;

// Create a confirmation modal for page navigation
const createNavigationConfirmationModal = () => {
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
};

// Start the test
startButton.addEventListener("click", () => {
  if (!testStarted) {
    // Start the test
    document.getElementById("test-controls").style.display = "none";
    testArea.style.display = "block";
    goBackButton.style.display = "none"; // Hide the GoBack button
    loadNextQuestion();
    testStarted = true; // Set flag to true to indicate the test has started
    startButton.textContent = "Go back"; // Change button text after starting the test

    // Add event listener for page navigation
    window.addEventListener("beforeunload", confirmNavigation);
  }
});

// Confirmation for page navigation
function confirmNavigation(event) {
  if (testStarted) {
    event.preventDefault(); // Standard way to show confirmation dialog
    event.returnValue = ""; // Required for Chrome
  }
}

// Go back button handler
goBackButton.addEventListener("click", () => {
  if (testStarted) {
    // If test has started, show confirmation modal
    const modal = createNavigationConfirmationModal();
    document.body.appendChild(modal);

    // Add event listeners to modal buttons
    document
      .getElementById("confirm-navigation")
      .addEventListener("click", () => {
        // Remove the navigation prevention
        window.removeEventListener("beforeunload", confirmNavigation);
        // Redirect to allTests page
        window.location.href = "allTests";
      });

    document
      .getElementById("cancel-navigation")
      .addEventListener("click", () => {
        // Remove the modal if cancelled
        document.body.removeChild(modal);
      });
  } else {
    // If test hasn't started, just redirect
    window.location.href = "allTests";
  }
});

function loadNextQuestion() {
  feedback.textContent = "";
  optionsContainer.innerHTML = "";

  if (currentTest < testData.length) {
    const currentData = testData[currentTest];
    testImage.src = currentData.file;

    // Add buttons for each option
    currentData.options.forEach((option) => {
      const button = document.createElement("button");
      button.textContent = option;
      button.onclick = () => {
        checkAnswer(option, currentData.answer);
        // Automatically move to the next question after a short delay
        setTimeout(() => {
          currentTest++;
          loadNextQuestion();
        }, 1000); // Delay to show feedback before moving to the next question
      };
      optionsContainer.appendChild(button);
    });
  } else {
    showFinalResults();
  }
}

function checkAnswer(selectedOption, correctAnswer) {
  if (selectedOption === correctAnswer) {
    feedback.textContent = "Correct!";
    feedback.style.color = "green";
    score++;
  } else {
    feedback.textContent = `Wrong answer!`;
    feedback.style.color = "red";
    incorrectAnswers++;
  }
}

function showFinalResults() {
  // Remove navigation prevention when test is completed
  window.removeEventListener("beforeunload", confirmNavigation);

  testImage.style.display = "none";
  optionsContainer.style.display = "none";
  instructions.style.display = "none";

  // Clear previous content in the content container
  const contentContainer = document.querySelector(".content-container");
  contentContainer.innerHTML = "";


  // Create and display the title
  const titleElement = document.createElement("h1");
  titleElement.id = "final-title";
  titleElement.textContent = "Color Vision Test Completed!";
  titleElement.style.textAlign = "center";
  titleElement.style.marginBottom = "20px";
  contentContainer.appendChild(titleElement);

  // Create feedback message
  const feedbackMessage = document.createElement("div");
  feedbackMessage.style.marginTop = "20px";
  feedbackMessage.style.fontSize = "1.2rem";
  feedbackMessage.style.fontWeight = "bold";

  // Show the feedback message based on the number of incorrect answers
  let feedbackText = "";

  if (incorrectAnswers === 0) {
    feedbackMessage.style.color = "green";
    feedbackText = `Your eyes seem excellent! You have perfect color vision.`;
  } else if (incorrectAnswers === 1) {
    feedbackMessage.style.color = "green";
    feedbackText = `Your eyes are doing well! You had 1 incorrect answer, but that's no big deal.`;
  } else if (incorrectAnswers === 2) {
    feedbackMessage.style.color = "orange";
    feedbackText = `Your eyes show minor issues. Consider taking a follow-up test or consulting a specialist.`;
  } else {
    feedbackMessage.style.color = "red";
    feedbackText = `Your color vision might need further evaluation. It's recommended to consult an eye care professional.`;
  }

  // Display the score in the feedback message
  feedbackMessage.textContent = `${feedbackText} You scored ${score} out of ${testData.length}.`;

  // Save feedback without the score in the feedBack variable
  feedBack = feedbackText; // Only save the feedback text without the score
  contentContainer.appendChild(feedbackMessage);

  // Create OK button
  const okButton = document.createElement("button");
  okButton.textContent = "OK";
  okButton.style.marginTop = "20px";
  okButton.style.padding = "10px 20px";
  okButton.style.fontSize = "1rem";
  okButton.style.cursor = "pointer";
  okButton.style.backgroundColor = "#4CAF50";
  okButton.style.color = "white";
  okButton.style.border = "none";
  okButton.style.borderRadius = "5px";

  // Add click event listener to OK button
  okButton.addEventListener("click", () => {
    // Clear the content container
    contentContainer.innerHTML = "";

    // Show "Saving results" message
    const savingResultsMessage = document.createElement("div");
    savingResultsMessage.id = "saving-results-message";
    savingResultsMessage.style.marginTop = "20px";
    savingResultsMessage.style.fontSize = "1.5rem";
    savingResultsMessage.style.fontWeight = "bold";
    savingResultsMessage.style.color = "#337ab7"; // Blue color
    savingResultsMessage.textContent = "Saving results...";
    contentContainer.appendChild(savingResultsMessage);

    // Save results and redirect
    saveTestResult();
    setTimeout(() => {
      window.location.href = "allTests";
    }, 2200);
  });

  // Append OK button
  contentContainer.appendChild(okButton);
}

function saveTestResult() {
  const resultData = {
    score: score,
    incorrectanswers: incorrectAnswers,
    feedBack: feedBack,
  };
  console.log("Saving Test Results:", resultData);
  fetch("/Color_Vision_save_results", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(resultData), // Sending the results as JSON
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log("Test results saved successfully.");
      } else {
        console.log("Error saving test results.");
      }
    })
    .catch((error) => console.error("Error:", error));
}
