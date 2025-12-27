let lastScrollY = window.scrollY;
let scrollTimeout;

const fab = document.querySelector(".fab");
const overlay = document.getElementById("overlay");
const dueInput = document.getElementById("dueDateInput");
const dueContainer = document.getElementById("dueDateBoxes");

/* ---------- SCROLL FAB LOGIC ---------- */
window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY;

  // Hide only when scrolling down
  if (currentScrollY > lastScrollY) {
    fab.classList.add("hidden");
  }

  lastScrollY = currentScrollY;

  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    fab.classList.remove("hidden");
  }, 600);
});

/* ---------- DATE BOX HELPERS ---------- */

function createBox(value, space) {
  const box = document.createElement("div");
  box.className = "date-box";
  box.textContent = value || "";
  if (space === 9) box.classList.add("space-9");
  return box;
}

function createSeparator() {
  const sep = document.createElement("div");
  sep.className = "date-separator";
  sep.textContent = "-";
  return sep;
}

function createEmptyDate(container) {
  container.innerHTML = "";

  // DD
  container.appendChild(createBox("", 9));
  container.appendChild(createBox("", 0));
  container.appendChild(createSeparator());

  // MM
  container.appendChild(createBox("", 9));
  container.appendChild(createBox("", 0));
  container.appendChild(createSeparator());

  // YYYY
  for (let i = 0; i < 4; i++) {
    container.appendChild(createBox("", i < 3 ? 9 : 0));
  }
}

function createDateBoxes(containerId, dateStr) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  if (!dateStr) {
    createEmptyDate(container);
    return;
  }

  const [year, month, day] = dateStr.split("-");

  // DD
  container.appendChild(createBox(day[0], 9));
  container.appendChild(createBox(day[1], 0));
  container.appendChild(createSeparator());

  // MM
  container.appendChild(createBox(month[0], 9));
  container.appendChild(createBox(month[1], 0));
  container.appendChild(createSeparator());

  // YYYY
  year.split("").forEach((d, i) => {
    container.appendChild(createBox(d, i < 3 ? 9 : 0));
  });
}

/* ---------- OPEN MODAL ---------- */

fab.addEventListener("click", () => {
  overlay.style.display = "flex";

  const today = new Date().toISOString().split("T")[0];

  // Start date filled
  createDateBoxes("startDateBoxes", today);

  // Due date empty
  createDateBoxes("dueDateBoxes", null);
  dueContainer.classList.remove("filled");
});

/* ---------- DUE DATE PICKER ---------- */


// Fill boxes after date selection
dueInput.addEventListener("change", () => {
  createDateBoxes("dueDateBoxes", dueInput.value);
  dueContainer.classList.add("filled");
});

dueContainer.addEventListener("click", () => {
  dueInput.showPicker?.(); // modern browsers
  dueInput.focus();
  dueInput.click();        // fallback
});
dueContainer.querySelectorAll(".date-box, .date-separator")
  .forEach(el => {
    el.style.cursor = "pointer";
  });

  const categoryPills = document.querySelectorAll(".category-pill");

categoryPills.forEach((pill) => {
  pill.addEventListener("click", () => {
    categoryPills.forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");
  });
});

