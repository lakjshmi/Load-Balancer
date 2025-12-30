let lastScrollY = window.scrollY;
let scrollTimeout;

const fab = document.querySelector(".fab");
const overlay = document.getElementById("overlay");
const closeModalBtn = document.getElementById("closeModalBtn");

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
  dueInput.click(); // fallback
});
dueContainer.querySelectorAll(".date-box, .date-separator").forEach((el) => {
  el.style.cursor = "pointer";
});

const categoryPills = document.querySelectorAll(".category-pill");

categoryPills.forEach((pill) => {
  pill.addEventListener("click", () => {
    categoryPills.forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");
  });
});

const nameInput = document.getElementById("entryName");
const donePill = document.getElementById("donePill");

let selectedCategory = "Task"; // default since Task is active initially

/* ---------- CATEGORY TRACKING ---------- */
categoryPills.forEach((pill) => {
  pill.addEventListener("click", () => {
    categoryPills.forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");

    selectedCategory = pill.textContent.trim();
    checkFormValidity();
  });
});

/* ---------- FORM VALIDATION ---------- */
function checkFormValidity() {
  const nameFilled = nameInput.value.trim().length > 0;
  const dueFilled = dueInput.value !== "";

  const categoryFilled = !!selectedCategory;

  if (nameFilled && dueFilled && categoryFilled) {
    donePill.classList.add("enabled");
    donePill.classList.remove("disabled");
  } else {
    donePill.classList.remove("enabled");
    donePill.classList.add("disabled");
  }
}

/* ---------- LISTENERS ---------- */
nameInput.addEventListener("input", checkFormValidity);
dueInput.addEventListener("change", checkFormValidity);
function getEntries() {
  return JSON.parse(localStorage.getItem("entries")) || [];
}

function saveEntries(entries) {
  localStorage.setItem("entries", JSON.stringify(entries));
}
function createEntryElement(entry) {
  const wrapper = document.createElement("div");
  wrapper.className = "each-entry";
  wrapper.dataset.category = entry.category; // for future tab filtering

  const nameDiv = document.createElement("div");
  nameDiv.className = "entry-name";
  nameDiv.textContent = entry.name;

  const dateDiv = document.createElement("div");
  dateDiv.className = "entry-date";
  dateDiv.textContent = formatDate(entry.dueDate);

  wrapper.appendChild(nameDiv);
  wrapper.appendChild(dateDiv);

  return wrapper;
}
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function renderEntries(filterCategory = null) {
  const entries = getEntries();
  const list = document.querySelector(".all-entries-list");

  list.innerHTML = "";

  const filteredEntries = filterCategory
    ? entries.filter((e) => e.category === filterCategory)
    : entries;

  filteredEntries.forEach((entry) => {
    list.appendChild(createEntryElement(entry));
  });
}

donePill.addEventListener("click", () => {
  if (!donePill.classList.contains("enabled")) return;

  const entry = {
    id: Date.now(),
    name: nameInput.value.trim(),
    dueDate: dueInput.value,
    category: selectedCategory,
  };

  const entries = getEntries();
  entries.push(entry);
  saveEntries(entries);

  renderEntries(); // re-render full list

  closeModal();
});
function closeModal() {
  overlay.style.display = "none";

  nameInput.value = "";
  dueInput.value = "";

  categoryPills.forEach((p) => p.classList.remove("active"));
  categoryPills[0].classList.add("active"); // Task default
  selectedCategory = "Task";

  donePill.classList.remove("enabled");
  donePill.classList.add("disabled");
}

document.addEventListener("DOMContentLoaded", () => {
  renderEntries(); // no filter on load
});

const taskTab = document.querySelector(".tab-left");
const courseTab = document.querySelector(".tab-center");
const ideaTab = document.querySelector(".tab-right");
const appTitle = document.querySelector(".app-title");

taskTab.addEventListener("click", () => {
  setActiveTab(taskTab);
  renderEntries("Task");
});

courseTab.addEventListener("click", () => {
  setActiveTab(courseTab);
  renderEntries("Course");
});

ideaTab.addEventListener("click", () => {
  setActiveTab(ideaTab);
  renderEntries("Idea");
});

appTitle.addEventListener("click", () => {
  setActiveTab(null); // reset highlight
  renderEntries();
});

const tabs = document.querySelectorAll(".tab");

function setActiveTab(activeTab = null) {
  tabs.forEach((tab) => tab.classList.remove("active"));
  if (activeTab) activeTab.classList.add("active");
}

//close the model when clicking outside the modal area
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) {
    closeModal();
  }
});
//close when clicked on X on top of the modal
closeModalBtn.addEventListener("click", closeModal);
