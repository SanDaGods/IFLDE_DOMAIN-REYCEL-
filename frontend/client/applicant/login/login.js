const BACKEND_URL = "https://eteeapbackend-production.up.railway.app";

document.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.querySelector(".wrapper");

  if (wrapper) wrapper.classList.add("active-popup");

  const buttons = {
    close: document.querySelector(".icon-close"),
    registerLink: document.querySelector(".register-link"),
    loginLink: document.querySelector(".login-link"),
    forgotLink: document.querySelector(".forgot-link"),
  };

  if (document.referrer) {
    sessionStorage.setItem("previousPage", document.referrer);
  }

  const resetInputs = () => {
    wrapper?.querySelectorAll("input").forEach((input) => {
      if (input.type === "checkbox") input.checked = false;
      else input.value = "";
    });
  };

  const showForm = (formType = "") => {
    wrapper?.classList.remove(
      "active",
      "active-forgot",
      "active-verification",
      "active-new-password"
    );
    if (formType) wrapper?.classList.add(formType);
    resetInputs();
  };

  buttons.registerLink?.addEventListener("click", (e) => {
    e.preventDefault();
    showForm("active");
  });

  buttons.loginLink?.addEventListener("click", (e) => {
    e.preventDefault();
    showForm("");
  });

  buttons.forgotLink?.addEventListener("click", (e) => {
    e.preventDefault();
    showForm("active-forgot");
  });

  document.getElementById("resetForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    document.querySelector(".form-box.forgot").style.display = "none";
    document.getElementById("verificationForm").style.display = "block";
    wrapper.classList.add("active-verification");
  });

  document.getElementById("verifyCodeForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    document.getElementById("verificationForm").style.display = "none";
    document.getElementById("newPasswordForm").style.display = "block";
    wrapper.classList.add("active-new-password");
  });

  document.getElementById("newPasswordSubmit")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {
      showNotification("Passwords do not match. Please try again.");
      return;
    }

    showNotification("Password successfully reset! Redirecting to login page...");
    showForm("");
  });

  document.querySelectorAll(".toggle-password").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const input = toggle.parentElement.querySelector("input");
      const icon = toggle.querySelector("ion-icon");

      if (input.type === "password") {
        input.type = "text";
        icon.setAttribute("name", "eye");
      } else {
        input.type = "password";
        icon.setAttribute("name", "eye-off");
      }
    });
  });

  document.getElementById("terms-link")?.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("terms-con").style.display = "block";
  });

  document.getElementById("accept-btn")?.addEventListener("click", () => {
    document.getElementById("terms-con").style.display = "none";
    document.getElementById("terms-checkbox").checked = true;
  });

  buttons.close?.addEventListener("click", () => {
    resetInputs();
    wrapper?.classList.remove(
      "active-popup",
      "active",
      "active-forgot",
      "active-verification",
      "active-new-password"
    );
    window.location.href = "/index.html";
  });

  // Register
  document.getElementById("registerForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const password = document.getElementById("regPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!email || !password || !confirmPassword) {
      showNotification("Please fill in all fields");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      showNotification("Enter a valid email (e.g., user@example.com)");
      return;
    }

    if (password !== confirmPassword) {
      showNotification("Passwords do not match!");
      return;
    }

    if (password.length < 8) {
      showNotification("Password must be at least 8 characters");
      return;
    }

    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = "Registering...";

    try {
      const response = await fetch(`${BACKEND_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get("content-type");

      if (!response.ok) {
        const errorText = await response.text();
        if (contentType?.includes("application/json")) {
          const data = JSON.parse(errorText);
          throw new Error(data.error || "Registration failed");
        } else {
          throw new Error(errorText);
        }
      }

      const data = await response.json();
      showNotification("Registration successful!");

      localStorage.setItem("userId", data.data.userId);
      localStorage.setItem("applicantId", data.data.applicantId);

      window.location.href =
        "https://eteeap-domain-uluo.vercel.app/frontend/client/applicant/info/information.html";
    } catch (error) {
      showNotification(`Registration failed: ${error.message}`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });

  // Login
  document.getElementById("loginForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
      showNotification("Please enter both email and password.");
      return;
    }

    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";

    try {
      const response = await fetch(`${BACKEND_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get("content-type");

      if (!response.ok) {
        const errorText = await response.text();
        if (contentType?.includes("application/json")) {
          const data = JSON.parse(errorText);
          throw new Error(data.error || "Login failed");
        } else {
          throw new Error("Login failed: " + errorText);
        }
      }

      const data = await response.json();
      showNotification("Login successful!");
      localStorage.setItem("userId", data.data.userId);
      localStorage.setItem("userEmail", data.data.email);

      window.location.href = "../Timeline/timeline.html";
    } catch (error) {
      showNotification(`Login failed: ${error.message}`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });
});

function showNotification(message, type = "info") {
  const existingNotifications = document.querySelectorAll(".notification");
  existingNotifications.forEach((n) => n.remove());

  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = "0";
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}
