// Theme toggle functionality
document.addEventListener("DOMContentLoaded", function () {
    const themeToggle = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");
    // Check saved theme preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.body.classList.add("dark-mode");
      themeIcon.classList.replace("fa-moon", "fa-sun");
    }
    themeToggle.addEventListener("click", function () {
      document.body.classList.toggle("dark-mode");
      const isDarkMode = document.body.classList.contains("dark-mode");
      // Update icon
      if (isDarkMode) {
        themeIcon.classList.replace("fa-moon", "fa-sun");
        localStorage.setItem("theme", "dark");
      } else {
        themeIcon.classList.replace("fa-sun", "fa-moon");
        localStorage.setItem("theme", "light");
      }
    });
    // Profile form submission
    const profileForm = document.getElementById("profile-form");
    profileForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const formData = new FormData(profileForm);
      try {
        const response = await fetch("/update_profile", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        if (result.success) {
          alert("Profile updated successfully!");
        } else {
          alert(result.message || "Failed to update profile");
        }
      } catch (error) {
        alert("An error occurred while updating profile");
      }
    });
    // Password change form submission
    const securityForm = document.getElementById("security-form");
    securityForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const newPassword = document.getElementById("new-password").value;
      const confirmPassword = document.getElementById("confirm-password").value;
      if (newPassword !== confirmPassword) {
        alert("New passwords do not match!");
        return;
      }
      const formData = new FormData(securityForm);
      try {
        const response = await fetch("/change_password", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        if (result.success) {
          alert("Password changed successfully!");
          securityForm.reset();
        } else {
          alert(result.message || "Failed to change password");
        }
      } catch (error) {
        alert("An error occurred while changing password");
      }
    });
    // Delete account functionality
    const deleteAccountBtn = document.getElementById("delete-account");
    deleteAccountBtn.addEventListener("click", async function () {
      if (
        confirm(
          "Are you sure you want to delete your account? This action cannot be undone."
        )
      ) {
        try {
          const response = await fetch("/delete_account", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });
          const result = await response.json();
          if (result.success) {
            alert("Account deleted successfully");
            if (result.redirect) {
              window.location.replace(result.redirect);
            } else {
              window.location.replace("/");
            }
          } else {
            alert(result.message || "Failed to delete account");
          }
        } catch (error) {
          alert("An error occurred while deleting account");
          console.error(error);
        }
      }
    });
  });