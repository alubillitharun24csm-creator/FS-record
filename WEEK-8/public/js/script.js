// ---------- Helpers ----------
function showMessage(el, text, type) {
  el.textContent = text;
  el.className = `message show ${type}`;
}

// ---------- Registration ----------
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msgEl = document.getElementById("regMessage");
    const formData = new FormData(registerForm);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        showMessage(msgEl, data.message, "success");
        registerForm.reset();
        setTimeout(() => (window.location.href = "/login"), 1200);
      } else {
        showMessage(msgEl, data.message, "error");
      }
    } catch (err) {
      showMessage(msgEl, "Something went wrong. Please try again.", "error");
    }
  });
}

// ---------- Login ----------
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msgEl = document.getElementById("loginMessage");
    const formData = new FormData(loginForm);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        showMessage(msgEl, data.message, "success");
        sessionStorage.setItem("careQueueUser", JSON.stringify(data.user));
        setTimeout(() => (window.location.href = "/dashboard"), 700);
      } else {
        showMessage(msgEl, data.message, "error");
      }
    } catch (err) {
      showMessage(msgEl, "Something went wrong. Please try again.", "error");
    }
  });
}

// ---------- Dashboard ----------
const welcomeName = document.getElementById("welcomeName");
if (welcomeName) {
  const stored = sessionStorage.getItem("careQueueUser");

  if (!stored) {
    window.location.href = "/login";
  } else {
    const user = JSON.parse(stored);

    welcomeName.textContent = `Welcome, ${user.name.split(" ")[0]}`;
    document.getElementById("pName").textContent = user.name || "-";
    document.getElementById("pAge").textContent = user.age || "-";
    document.getElementById("pGender").textContent = user.gender || "-";
    document.getElementById("pEmail").textContent = user.email || "-";
    document.getElementById("pMobile").textContent = user.mobile || "-";
    document.getElementById("pBlood").textContent = user.bloodGroup || "-";
    document.getElementById("pEmergency").textContent = user.emergencyContact || "-";
    document.getElementById("pAddress").textContent = user.address || "-";

    if (user.preferredDepartment) {
      const deptSelect = document.getElementById("deptSelect");
      if (deptSelect) deptSelect.value = user.preferredDepartment;
    }

    // Logout
    const doLogout = () => {
      sessionStorage.removeItem("careQueueUser");
      window.location.href = "/login";
    };
    document.getElementById("logoutBtn").addEventListener("click", doLogout);
    document.getElementById("logoutLink").addEventListener("click", (e) => {
      e.preventDefault();
      doLogout();
    });

    // Queue token generation
    document.getElementById("getTokenBtn").addEventListener("click", async () => {
      const department = document.getElementById("deptSelect").value;
      try {
        const res = await fetch("/queue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ department })
        });
        const data = await res.json();
        if (data.success) {
          document.getElementById("tokenNumber").textContent = data.token;
          document.getElementById("tokenDept").textContent = data.department;
          document.getElementById("tokenDisplay").style.display = "block";
        }
      } catch (err) {
        alert("Could not generate a token. Please try again.");
      }
    });
  }
}
