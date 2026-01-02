let lastScrollY = window.scrollY;
let scrollTimeout;
let editingEntryId = null;
let currentFilter = null; // null = all

const tabClickSound = new Audio("trimmed.m4a");
tabClickSound.volume = 1; // adjust as needed

const completeSound = new Audio("cheer.mp3"); // ✅ task completed
const deleteSound = new Audio("wtf.mp3");
const fabSound = new Audio("plop.m4a");

fabSound.preload = "auto";
fabSound.load(); // 🔥 force decode now

fabSound.volume = 1;
completeSound.volume = 1;
deleteSound.volume = 1;

const fab = document.querySelector(".fab");
const overlay = document.getElementById("overlay");
const closeModalBtn = document.getElementById("closeModalBtn");

const dueInput = document.getElementById("dueDateInput");
const dueContainer = document.getElementById("dueDateBoxes");

const startInput = document.getElementById("startDateInput");
const startContainer = document.getElementById("startDateBoxes");

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
  fabSound.currentTime = 0;
  fabSound.play();
  overlay.style.display = "flex";

  const today = new Date().toISOString().split("T")[0];

  // START DATE (editable)
  startInput.value = today;
  createDateBoxes("startDateBoxes", today);

  // DUE DATE empty
  dueInput.value = "";
  createDateBoxes("dueDateBoxes", null);
  dueContainer.classList.remove("filled");

  // NAME background state
  updateNameBackground();

  // 🔥 SET DEFAULT CATEGORY BASED ON ACTIVE TAB
  const defaultCategory = currentFilter || "Task";
  selectedCategory = defaultCategory;

  categoryPills.forEach((pill) => {
    pill.classList.toggle(
      "active",
      pill.textContent.trim() === defaultCategory
    );
  });

  // Reset DONE state
  donePill.classList.remove("enabled");
  donePill.classList.add("disabled");
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

/* ---------- START DATE PICKER ---------- */

// Fill boxes after date selection
startInput.addEventListener("change", () => {
  createDateBoxes("startDateBoxes", startInput.value);
});

// Clicking boxes opens calendar
startContainer.addEventListener("click", () => {
  startInput.showPicker?.();
  startInput.focus();
  startInput.click();
});

// Cursor feedback
startContainer.querySelectorAll(".date-box, .date-separator").forEach((el) => {
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
function updateNameBackground() {
  if (nameInput.value.trim().length === 0) {
    nameInput.classList.add("empty");
  } else {
    nameInput.classList.remove("empty");
  }
}

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
nameInput.addEventListener("input", () => {
  checkFormValidity();
  updateNameBackground();
});

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

  if (entry.completed) {
    wrapper.classList.add("completed");
  }

  const nameDiv = document.createElement("div");
  nameDiv.className = "entry-name";
  nameDiv.textContent = entry.name;

  const dateDiv = document.createElement("div");
  dateDiv.className = "entry-date";
  dateDiv.textContent = formatDate(entry.dueDate);

  wrapper.appendChild(nameDiv);
  wrapper.appendChild(dateDiv);

  let clickTimer = null;
  let startX = 0;
  let currentX = 0;
  let isDragging = false;

  /* ---------- TOUCH / SWIPE LOGIC ---------- */

  wrapper.addEventListener("pointerdown", (e) => {
    startX = e.clientX;
    isDragging = true;
    wrapper.style.transition = "none";
  });

  wrapper.addEventListener("pointermove", (e) => {
    if (!isDragging) return;

    currentX = e.clientX - startX;

    // limit drag distance
    if (Math.abs(currentX) > 120) return;

    wrapper.style.transform = `translateX(${currentX}px)`;
  });

  wrapper.addEventListener("pointerup", () => {
    wrapper.style.transition = "transform 0.3s ease";

    // 👉 SWIPE RIGHT → COMPLETE
    if (currentX < -80) {
      toggleComplete(entry.id);
    }

    // 👈 SWIPE LEFT → DELETE
    else if (currentX > 80) {
      deleteEntry(entry.id);
      return;
    }

    wrapper.style.transform = "translateX(0)";
    isDragging = false;
    startX = 0;
    currentX = 0;
  });
  wrapper.addEventListener("pointercancel", () => {
    wrapper.style.transform = "translateX(0)";
    isDragging = false;
  });

  /* ---------- CLICK / DOUBLE CLICK ---------- */

  wrapper.addEventListener("click", () => {
    if (clickTimer) return;

    clickTimer = setTimeout(() => {
      clickTimer = null;
    }, 250);
  });

  wrapper.addEventListener("dblclick", () => {
    clearTimeout(clickTimer);
    clickTimer = null;
    openEditModal(entry);
  });
  return wrapper;
}
function toggleComplete(id) {
  const entries = getEntries();
  const index = entries.findIndex((e) => e.id === id);
  if (index === -1) return;

  const wasCompleted = entries[index].completed; // ✅ REQUIRED

  entries[index].completed = !entries[index].completed;
  // 🔊 play cheer ONLY when marking complete
  if (!wasCompleted && entries[index].completed) {
    completeSound.currentTime = 0;
    completeSound.play();
  }
  saveEntries(entries);
  renderEntries(currentFilter);
}

function deleteEntry(id) {
  const confirmed = confirm("Delete this entry?");
  if (!confirmed) return;
  deleteSound.currentTime = 0;
  deleteSound.play();
  const entries = getEntries().filter((e) => e.id !== id);
  saveEntries(entries);

  renderEntries(currentFilter);
}

function openEditModal(entry) {
  editingEntryId = entry.id;

  overlay.style.display = "flex";

  // Fill name
  nameInput.value = entry.name;
  updateNameBackground();

  // Fill start date
  startInput.value = entry.startDate;
  createDateBoxes("startDateBoxes", entry.startDate);

  // Fill due date
  dueInput.value = entry.dueDate;
  createDateBoxes("dueDateBoxes", entry.dueDate);
  dueContainer.classList.add("filled");

  // Category
  categoryPills.forEach((p) => {
    p.classList.toggle("active", p.textContent.trim() === entry.category);
    document.getElementById("deletePill").style.display = "block";
  });

  selectedCategory = entry.category;

  checkFormValidity();
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

function validateDates() {
  const startDate = new Date(startInput.value);
  const dueDate = new Date(dueInput.value);

  // If either date is missing, skip this validation
  if (!startInput.value || !dueInput.value) return true;

  if (startDate > dueDate) {
    alert("Start date cannot be after the due date.");
    return false;
  }

  return true;
}

donePill.addEventListener("click", () => {
  if (!donePill.classList.contains("enabled")) return;
  if (!validateDates()) return;

  const entries = getEntries();

  if (editingEntryId) {
    const index = entries.findIndex((e) => e.id === editingEntryId);
    if (index !== -1) {
      entries[index] = {
        ...entries[index],
        name: nameInput.value.trim(),
        startDate: startInput.value, // ✅ FIX
        dueDate: dueInput.value,
        category: selectedCategory,
      };
    }
  } else {
    entries.push({
      id: Date.now(),
      name: nameInput.value.trim(),
      startDate: startInput.value, // ✅ FIX
      dueDate: dueInput.value,
      category: selectedCategory,
      completed: false,
    });
  }

  saveEntries(entries);
  renderEntries(currentFilter);
  closeModal();
});

function closeModal() {
  overlay.style.display = "none";

  nameInput.value = "";
  updateNameBackground();
  dueInput.value = "";
  startInput.value = "";

  editingEntryId = null; // 🔴 important

  categoryPills.forEach((p) => p.classList.remove("active"));
  categoryPills[0].classList.add("active"); // Task default
  selectedCategory = "Task";

  donePill.classList.remove("enabled");
  donePill.classList.add("disabled");
}

document.addEventListener("DOMContentLoaded", () => {
  renderEntries(currentFilter); // no filter on load
});

const taskTab = document.querySelector(".tab-left");
const courseTab = document.querySelector(".tab-center");
const ideaTab = document.querySelector(".tab-right");
const appTitle = document.querySelector(".app-title");

function playTabSound() {
  tabClickSound.currentTime = 0; // allows rapid taps
  tabClickSound.play();
}

taskTab.addEventListener("click", () => {
  playTabSound();
  if (taskTab.classList.contains("active")) {
    // 🔁 already active → reset
    setActiveTab(null);
    currentFilter = null;
    renderEntries();
  } else {
    // ▶️ normal activation
    setActiveTab(taskTab);
    currentFilter = "Task";
    renderEntries(currentFilter);
  }
});

courseTab.addEventListener("click", () => {
  playTabSound();
  if (courseTab.classList.contains("active")) {
    setActiveTab(null);
    currentFilter = null;
    renderEntries();
  } else {
    setActiveTab(courseTab);
    currentFilter = "Course";
    renderEntries(currentFilter);
  }
});

ideaTab.addEventListener("click", () => {
  playTabSound();
  if (ideaTab.classList.contains("active")) {
    setActiveTab(null);
    currentFilter = null;
    renderEntries();
  } else {
    setActiveTab(ideaTab);
    currentFilter = "Idea";
    renderEntries(currentFilter);
  }
});

appTitle.addEventListener("click", () => {
  setActiveTab(null);
  currentFilter = null;
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

const deletePill = document.getElementById("deletePill");

deletePill.addEventListener("click", () => {
  if (!editingEntryId) return;

  const confirmed = confirm("Delete this entry?");
  if (!confirmed) return;

  const entries = getEntries().filter((e) => e.id !== editingEntryId);
  saveEntries(entries);

  renderEntries(currentFilter);
  closeModal();
});
