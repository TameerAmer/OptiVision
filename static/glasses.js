document.addEventListener("DOMContentLoaded", () => {
    const eyewearPromptModal = document.getElementById("eyewear-prompt-modal");
    const yesButton = document.getElementById("yes-glasses");
    const noButton = document.getElementById("no-glasses");

    // Display the modal immediately when the page loads
    eyewearPromptModal.style.display = "flex";

    // Handling the "Yes" button
    yesButton.addEventListener("click", () => {
        alert("Please remove your glasses or lenses before starting the test.");
        updateGlassesStatus(true);  // Update the database
        eyewearPromptModal.style.display = "none";
        startTest();  // Start the test after closing the modal
    });

    // Handling the "No" button
    noButton.addEventListener("click", () => {
        updateGlassesStatus(false); // Update the database
        eyewearPromptModal.style.display = "none";
        startTest();  // Start the test after closing the modal
    });
});

function updateGlassesStatus(wearsGlasses) {
    // Redirect immediately, don't wait for the fetch to complete
    window.location.href = '/VisualAcuityTest';

    // Send the update to the server
    fetch('/update_glasses_status', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wearsGlasses: wearsGlasses })
    })
        .then(response => response.json())
        .then(data => {
            console.log("Glasses status updated:", data);
        })
        .catch(error => console.error('Error updating glasses status:', error));
}

