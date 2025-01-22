// Define the tests with their rotation angles, correct answers, and sizes
const tests = [
  { level: 1, rotation: 0, correctAnswer: "1", width: "35px" },
  { level: 2, rotation: 270, correctAnswer: "7", width: "28px" },
  { level: 3, rotation: 45, correctAnswer: "2", width: "24px" },
  { level: 4, rotation: 135, correctAnswer: "4", width: "24px" },
  { level: 5, rotation: 180, correctAnswer: "5", width: "18px" },
  { level: 6, rotation: 90, correctAnswer: "3", width: "18px" },
  { level: 7, rotation: 270, correctAnswer: "7", width: "12px" },
  { level: 8, rotation: 225, correctAnswer: "6", width: "12px" },
  { level: 9, rotation: 0, correctAnswer: "1", width: "8px" },
  { level: 10, rotation: 180, correctAnswer: "5", width: "8px" },
  { level: 11, rotation: 90, correctAnswer: "3", width: "8px" },
  { level: 12, rotation: 135, correctAnswer: "4", width: "6px" },
  { level: 13, rotation: 315, correctAnswer: "8", width: "6px" },
  { level: 14, rotation: 45, correctAnswer: "2", width: "4px" },
  { level: 15, rotation: 270, correctAnswer: "7", width: "3px" },
  { level: 16, rotation: 225, correctAnswer: "6", width: "3px" },
  { level: 17, rotation: 0, correctAnswer: "1", width: "3px" },
];

let currentTestIndex = 0;
let incorrectAnswers = 0;
let highestLevelPassed = 1;
let currentEye = "Left";
let leftEyeLevel = 0;
let rightEyeLevel = 0;
let rightEyeIncorrect = 0;
let leftEyeIncorrect = 0;
let feedBack = "";
let testInProgress = false;
let distanceCheckVisible = false;
let distanceCheckInterval = null;
let modelsLoaded = false;
// Create a navigation confirmation modal
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

// Function to determine vision feedback
function determineVisionFeedback(leftEye, rightEye) {
  const averageLevel = Math.floor((leftEye + rightEye) / 2);

  let feedback = {
    message: "",
    color: "",
  };

  if (averageLevel < 5) {
    feedback.message = "Your vision seems too low! You should visit an eye doctor immediately.";
    feedback.color = "#d9534f";
  } else if (averageLevel <= 10) {
    feedback.message = "Your vision needs attention. We recommend scheduling a visit to an eye doctor.";
    feedback.color = "#f0ad4e";
  } else if (averageLevel <= 14) {
    feedback.message = "Your vision is okay, but consider an eye checkup for better clarity.";
    feedback.color = "#f0ad4e";
  } else if (averageLevel >= 15 && averageLevel < 17) {
    feedback.message = "Your vision is very good, but remember to keep an eye on your health.";
    feedback.color = "#f0ad4e";
  } else if (averageLevel === 17) {
    feedback.message = "Great! Your vision seems excellent. Keep maintaining eye health.";
    feedback.color = "#5cb85c";
  }

  feedBack = feedback.message;
  feedback.message += `<br>Left Eye Level: ${leftEye}/17<br>Right Eye Level: ${rightEye}/17`;
  return feedback;
}

async function loadFaceDetectionModels() {
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/static/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/static/models')
    ]);
    modelsLoaded = true;
  } catch (error) {
    console.error('Error loading models:', error);
  }
}

function showDistanceCheck() {
  if (distanceCheckVisible) return;

  const overlay = document.createElement('div');
  overlay.className = 'distance-check-overlay';
  overlay.innerHTML = `
        <div class="distance-check-container">
            <h3>Distance Measurement</h3>
            <div class="camera-container">
                <video id="camera-feed" autoplay playsinline></video>
                <canvas id="face-overlay"></canvas>
                <div id="distance-display" class="distance-display">
                    Loading camera...
                </div>
            </div>
            <div class="distance-instructions">
                <p>Position your face in front of the camera</p>
                <p>Keep your head stable for accurate measurement</p>
                <p>Ideal distance is between 30-35 cm</p>
            </div>
            <button class="close-camera-btn">Close Camera</button>
        </div>
    `;
  document.body.appendChild(overlay);

  const closeBtn = overlay.querySelector('.close-camera-btn');
  closeBtn.addEventListener('click', () => {
    stopCamera();
    overlay.remove();
    distanceCheckVisible = false;
  });

  distanceCheckVisible = true;
  if (!modelsLoaded) {
    loadFaceDetectionModels().then(() => startCamera());
  } else {
    startCamera();
  }
}

async function startCamera() {
  const video = document.getElementById('camera-feed');
  const canvas = document.getElementById('face-overlay');
  const distanceDisplay = document.getElementById('distance-display');

  if (!video || !canvas) {
    console.error('Video or canvas element not found');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 640 },
        height: { ideal: 480 }
      }
    });

    video.srcObject = stream;
    video.play();

    canvas.width = video.width;
    canvas.height = video.height;

    // Start face detection loop
    if (distanceCheckInterval) {
      clearInterval(distanceCheckInterval);
    }

    distanceCheckInterval = setInterval(async () => {
      if (!video.paused && !video.ended) {
        const detections = await faceapi.detectAllFaces(
          video,
          new faceapi.TinyFaceDetectorOptions()
        ).withFaceLandmarks();

        if (detections && detections.length > 0) {
          const distance = calculateDistance(detections[0].detection.box);
          updateDistanceDisplay(distance, distanceDisplay);
        }
      }
    }, 100);

  } catch (error) {
    console.error('Camera start error:', error);
    alert('Unable to access camera. Please allow camera access.');
  }
}

function calculateDistance(faceBox) {
  // Adjusted constants for more accurate measurement
  const AVERAGE_FACE_WIDTH = 20; // Slightly adjusted average face width
  const FOCAL_LENGTH = 715; // Increased focal length
  const CALIBRATION_FACTOR = 1.2; // Added calibration factor

  // Use the face width detected by face-api.js
  const faceWidthInPixels = faceBox.width;

  // Calculate distance with calibration factor
  const distance = Math.round((AVERAGE_FACE_WIDTH * FOCAL_LENGTH) / (faceWidthInPixels * CALIBRATION_FACTOR));

  return distance;
}

function updateDistanceDisplay(distance, displayElement) {
  let message, className;
  if (distance < 30) {
    message = `Too close! Move back (${distance} cm)`;
    className = 'too-close';
  } else if (distance > 40) {  // Changed from 30 to 40 for 5cm tolerance
    message = `Too far! Move closer (${distance} cm)`;
    className = 'too-far';
  } else {
    message = `Perfect distance! (${distance} cm)`;
    className = 'perfect';
  }
  displayElement.textContent = message;
  displayElement.className = `distance-display ${className}`;
}

function stopCamera() {
  if (distanceCheckInterval) {
    clearInterval(distanceCheckInterval);
    distanceCheckInterval = null;
  }

  const video = document.getElementById('camera-feed');
  if (video && video.srcObject) {
    const tracks = video.srcObject.getTracks();
    tracks.forEach(track => track.stop());
    video.srcObject = null;
  }
}
// Function to handle closing the cover eye message
function handleCoverEyeOK() {
  const coverEyeMessage = document.getElementById("cover-eye-message");

  if (coverEyeMessage) {
    // Fade out the message
    coverEyeMessage.style.opacity = "0";

    setTimeout(() => {
      // Hide the message completely after fading out
      coverEyeMessage.style.display = "none";

      // Reset for right eye test
      leftEyeIncorrect = incorrectAnswers;
      currentTestIndex = 0;
      incorrectAnswers = 0;
      highestLevelPassed = 1;
      currentEye = "Right";

      // Update instructions for right eye
      document.getElementById("instructions").innerText =
        "I)Please cover your right eye!\nII)Keep your head in a distance of 30-35 cm from the screen!\nIII)Find the gap and mark it on the lower ring!";
      document.getElementById("instructions").style.cssText = `
        text-align: center; 
        font-size: 20px;
        `;

      // Update display
      const currentEyeDisplay = document.getElementById("current-eye");
      if (currentEyeDisplay) {
        currentEyeDisplay.textContent = `Current Eye: Right Eye`;
      }

      loadTest(); // Continue the test
    }, 500); // Wait for the fade-out transition to complete
  } else {
    console.error("Cover eye message element not found when trying to close!");
  }
}

// Modified loadTest function to handle eye switching
function loadTest() {
  const errorMessage = document.getElementById("error-message");
  errorMessage.style.display = "none";

  // Check if test is complete
  if (incorrectAnswers >= 3 || currentTestIndex >= tests.length) {
    if (currentEye === "Left") {
      leftEyeLevel = highestLevelPassed;
      leftEyeIncorrect = incorrectAnswers;
      // Show the pop-up message for switching to right eye
      const coverEyeMessage = document.getElementById("cover-eye-message");
      const okButton = document.getElementById("ok-button");

      console.log("Switching to right eye test");
      console.log("coverEyeMessage:", coverEyeMessage);
      console.log("okButton:", okButton);

      if (coverEyeMessage) {
        coverEyeMessage.style.display = "flex";
        coverEyeMessage.style.opacity = "1";
      } else {
        console.error("Cover eye message element not found!");
      }

      if (okButton) {
        // Remove any existing listeners first
        okButton.removeEventListener("click", handleCoverEyeOK);
        okButton.addEventListener("click", handleCoverEyeOK);
      } else {
        console.error("OK button not found!");
      }
      return;
    } else {
      rightEyeIncorrect = incorrectAnswers;
      endTest();
      return;
    }
  }

  const test = tests[currentTestIndex];

  // Rotate the littleCircle
  const littleCircle = document.querySelector(".littleCircle");
  littleCircle.style.transform = `rotate(${test.rotation}deg)`;
  littleCircle.style.width = test.width;

  // Update level display
  const levelDisplay = document.getElementById("current-level");
  if (levelDisplay) {
    levelDisplay.textContent = `Current Level: ${test.level}`;
  }

  // Add click event listeners to paths
  const paths = document.querySelectorAll("svg path");
  paths.forEach((path) => {
    path.removeEventListener("click", handleClick);
    path.addEventListener("click", handleClick);
  });
}

// Function to handle click on paths
function handleClick(event) {
  const test = tests[currentTestIndex];
  const clickedId = event.target.id;

  const errorMessage = document.getElementById("error-message");

  if (clickedId === test.correctAnswer) {
    // Correct answer: Determine progression
    if (test.level <= 10) {
      // First 10 levels: progress by 2
      currentTestIndex += 2;
    } else {
      // After Level 10: progress by 1
      currentTestIndex += 1;
    }

    // Update highest level passed
    highestLevelPassed = Math.max(highestLevelPassed, test.level);

    loadTest();
  } else {
    // Incorrect answer
    incorrectAnswers++;

    // Immediate test termination on third incorrect answer
    if (incorrectAnswers >= 3) {
      errorMessage.textContent = "Maximum incorrect answers reached.";
      errorMessage.style.display = "block";

      if (currentEye === "Left") {
        leftEyeLevel = highestLevelPassed;

        // Show the pop-up message for switching to right eye
        const coverEyeMessage = document.getElementById("cover-eye-message");
        const okButton = document.getElementById("ok-button");

        if (coverEyeMessage) {
          coverEyeMessage.style.display = "flex";
          coverEyeMessage.style.opacity = "1";
        }

        if (okButton) {
          okButton.removeEventListener("click", handleCoverEyeOK);
          okButton.addEventListener("click", handleCoverEyeOK);
        }

        return;
      } else {
        endTest();
        return;
      }
    }

    // Show error message
    errorMessage.textContent = "Wrong answer! Be careful.";
    errorMessage.style.display = "block";

    // Drop by 1 level after an incorrect answer
    currentTestIndex = Math.max(0, currentTestIndex - 1);

    loadTest();
  }
}

// Function to start the test
function startTest() {
  const testControls = document.getElementById("test-controls");
  const testArea = document.getElementById("test-area");

  testControls.style.display = "none";
  testArea.style.display = "block";

  // Reset test variables
  currentTestIndex = 0;
  incorrectAnswers = 0;
  highestLevelPassed = 1;
  currentEye = "Left";

  // Update eye display
  const currentEyeDisplay = document.getElementById("current-eye");
  currentEyeDisplay.textContent = `Current Eye: Left Eye`;
  // Set test in progress
  testInProgress = true;

  // Add navigation prevention
  window.addEventListener("beforeunload", confirmNavigation);

  loadTest();
}

// Confirmation for page navigation
function confirmNavigation(event) {
  if (testInProgress) {
    event.preventDefault(); // Standard way to show confirmation dialog
    event.returnValue = ""; // Required for Chrome
  }
}

// Function to end the test
function endTest() {
  const errorMessage = document.getElementById("error-message");
  const feedbackMessage = document.createElement("div");
  feedbackMessage.style.marginTop = "20px";
  feedbackMessage.style.fontSize = "1.2rem";
  feedbackMessage.style.fontWeight = "bold";

  // If we just finished the right eye test, record it
  if (currentEye === "Right") {
    rightEyeLevel = highestLevelPassed;
    rightEyeIncorrect = incorrectAnswers;
  }

  // Provide comprehensive feedback
  let visionFeedback = determineVisionFeedback(leftEyeLevel, rightEyeLevel);

  feedbackMessage.innerHTML = visionFeedback.message;
  feedbackMessage.style.color = visionFeedback.color;

  // Hide the test area
  const testArea = document.getElementById("test-area");
  if (testArea) {
    testArea.style.display = "none";
  }
  const instructionsArea = document.getElementById("instructions");
  if (instructionsArea) {
    instructionsArea.style.display = "none";
  }

  // Append feedback message to the page
  const contentContainer = document.querySelector(".content-container");
  contentContainer.appendChild(feedbackMessage);

  // Show the OK button
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

  // Append the button to the content container
  contentContainer.appendChild(okButton);

  // Add a click event listener to the OK button
  okButton.addEventListener("click", () => {
    window.removeEventListener("beforeunload", confirmNavigation); // Remove the navigation prevention event listener
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

    setTimeout(() => {
      window.location.href = "allTests";
    }, 2200);
    saveTestResult();
  });
}

// Add event listeners when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Start test button
  const startTestBtn = document.getElementById("start-test-btn");
  if (startTestBtn) {
    startTestBtn.addEventListener("click", startTest);
  }
  // OK Button for initial instructions
  const okButton = document.getElementById("okButton");
  if (okButton) {
    okButton.addEventListener("click", function () {
      // Change the content of the h1 and p elements
      document.getElementById("title").innerText = "Visual Acuity Test";
      document.getElementById("instructions").innerText =
        "I)Please cover your left eye!\nII)Keep your head in a distance of 30-35 cm from the screen!\nIII)Find the gap and mark it on the lower ring!";

      // Show the test screen and hide instructions
      const testControls = document.getElementById("test-controls");
      const testArea = document.getElementById("test-area");
      testControls.style.display = "none";
      testArea.style.display = "block";

      // Start the test
      startTest();
      window.addEventListener("beforeunload", confirmNavigation);
    });
  }

  // OK Button for cover eye message
  const coverEyeOkButton = document.getElementById("ok-button");
  if (coverEyeOkButton) {
    coverEyeOkButton.addEventListener("click", handleCoverEyeOK);
  }
});

function saveTestResult() {
  const resultData = {
    leftEyeLevel: leftEyeLevel,
    rightEyeLevel: rightEyeLevel,
    incorrectAnswers: incorrectAnswers,
    rightEyeIncorrect: rightEyeIncorrect,
    leftEyeIncorrect: leftEyeIncorrect,
    feedBack: feedBack,
  };
  console.log("Saving Test Results:", resultData);
  fetch("/Visual_Acuity_save_results", {
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

document.addEventListener("DOMContentLoaded", () => {
  const calibrationPage = document.getElementById("calibration-page");
  const instructionsPage = document.querySelector(".content-container");
  const calibrationSlider = document.getElementById("calibration-slider");
  const calibrationLine = document.getElementById("calibration-line");
  const calibrationOk = document.getElementById("calibration-ok");
  const basePxPerCm = 35;
  const baseLineLengthPx = 5 * basePxPerCm + 48;

  // Ensure calibration page is shown and others are hidden initially
  calibrationPage.style.display = "flex";
  instructionsPage.style.display = "none";

  // Set the default slider value and line width to match your base calibration
  calibrationSlider.value = baseLineLengthPx;
  calibrationLine.style.width = `${baseLineLengthPx}px`;

  // Update the calibration line dynamically based on slider value
  calibrationSlider.addEventListener("input", () => {
    const sliderValue = calibrationSlider.value;
    calibrationLine.style.width = `${sliderValue}px`;
  });

  // Handle calibration confirmation
  calibrationOk.addEventListener("click", () => {
    const sliderValue = calibrationSlider.value;
    const calibratedPxPerCm = sliderValue / 5; // 5 cm as the reference
    const scalingFactor = calibratedPxPerCm / basePxPerCm;

    adjustTests(scalingFactor);

    // Hide the calibration page and show the instructions page
    calibrationPage.style.display = "none";
    instructionsPage.style.display = "block";

    console.log(`Calibration complete. pxPerCm: ${calibratedPxPerCm}, Scaling Factor: ${scalingFactor}`);
  });

  // Function to adjust the tests array based on the scaling factor
  function adjustTests(scalingFactor) {
    tests.forEach((test) => {
      const originalWidth = parseFloat(test.width.replace("px", ""));
      test.width = `${originalWidth * scalingFactor}px`;
    });
    console.log("Adjusted tests:", tests);
  }
});





