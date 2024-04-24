// TASK: import helper functions from utils
// TASK: import initialData

/*************************************************************************************************************************************************
 * FIX BUGS!!!
 ***********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem("tasks")) {
    localStorage.setItem("tasks", JSON.stringify(initialData));
    localStorage.setItem("showSideBar", "true");
  } else {
    console.log("Data already exists in localStorage");
  }
}

// TASK: Get elements from the DOM
const elements = {
  sideBar: document.getElementById("side-bar-div"),
  hideSideBarBtn: document.getElementById("hide-side-bar-btn"),
  showSideBarBtn: document.getElementById("show-side-bar-btn"),
  themeToggleCheckbox: document.getElementById("switch"),
  headerBoardName: document.getElementById("header-board-name"),
  createNewTaskBtn: document.getElementById("add-new-task-btn"),
  editTaskModal: document.querySelector(".edit-task-modal-window"),
  modalWindow: document.getElementById("new-task-modal-window"),
  filterDiv: document.getElementById("filterDiv"),
};

let activeBoard = "";

// Extracts unique board names from tasks
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks(); // Presumably a function to fetch tasks
  const boards = [...new Set(tasks.map((task) => task.board).filter(Boolean))];
  displayBoards(boards);

  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = localStorageBoard || boards[0];
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ""; // Clear the container

  boards.forEach((board) => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");

    boardElement.addEventListener("click", () => {
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board; // Assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });

    boardsContainer.appendChild(boardElement);
  });
}

// Filters tasks corresponding to the board name and displays them in the DOM
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks();
  const filteredTasks = tasks.filter((task) => task.board === boardName);

  elements.todoColumn = document.querySelector(
    '.column-div[data-status="todo"] .tasks-container'
  );
  elements.doingColumn = document.querySelector(
    '.column-div[data-status="doing"] .tasks-container'
  );
  elements.doneColumn = document.querySelector(
    '.column-div[data-status="done"] .tasks-container'
  );

  [elements.todoColumn, elements.doingColumn, elements.doneColumn].forEach(
    (column) => {
      const status = column.getAttribute("data-status");
      column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;
      const tasksContainer = document.createElement("div");
      tasksContainer.className = "tasks-container";
      column.appendChild(tasksContainer);

      filteredTasks
        .filter((task) => task.status === status)
        .forEach((task) => {
          const taskElement = document.createElement("div");
          taskElement.className = "task-div";
          taskElement.textContent = task.title;
          taskElement.setAttribute("data-task-id", task.id);

          // Set event listener for opening the edit task modal
          taskElement.addEventListener("click", () => {
            openEditTaskModal(task);
          });

          tasksContainer.appendChild(taskElement);
        });
    }
  );
}

function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

function styleActiveBoard(boardName) {
  document.querySelectorAll(".board-btn").forEach((btn) => {
    if (btn.textContent === boardName) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

function addTaskToUI(task) {
  const column = document.querySelector(
    `.column-div[data-status="${task.status}"]`
  );
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector(".tasks-container");
  if (!tasksContainer) {
    console.warn(
      `Tasks container not found for status: ${task.status}, creating one.`
    );
    tasksContainer = document.createElement("div");
    tasksContainer.className = "tasks-container";
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement("div");
  taskElement.className = "task-div";
  taskElement.textContent = task.title;
  taskElement.setAttribute("data-task-id", task.id);

  tasksContainer.appendChild(taskElement);
}

function setupEventListeners() {
  elements.filterDiv.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  elements.createNewTaskBtn.addEventListener("click", () => {
    toggleModal(true);
    elements.filterDiv.style.display = "block";
  });

  elements.modalWindow.addEventListener("submit", (event) => {
    addTask(event);
  });

  elements.hideSideBarBtn.addEventListener("click", () => {
    toggleSidebar(false);
  });

  elements.showSideBarBtn.addEventListener("click", () => {
    toggleSidebar(true);
  });

  elements.themeToggleCheckbox.addEventListener("change", () => {
    toggleTheme();
  });
}

function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? "block" : "none";
}

function addTask(event) {
  event.preventDefault();

  const task = {
    title: document.getElementById("title-input").value,
    description: document.getElementById("desc-input").value,
    status: document.getElementById("select-status").value,
    board: activeBoard,
  };

  const newTask = createNewTask(task); // Presumably a function that adds a new task
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
    event.target.reset(); // Resets the form fields
    refreshTasksUI();
  }
}

function toggleSidebar(show) {
  const sidebar = elements.sideBar;
  if (sidebar) {
    sidebar.style.display = show ? "block" : "none";
  }
}

function toggleTheme() {
  const isLightTheme = document.body.classList.toggle("light-theme");
  localStorage.setItem("light-theme", isLightTheme ? "enabled" : "disabled");
}

function openEditTaskModal(task) {
  // Set task details in modal inputs
  const editTaskForm = document.getElementById("edit-task-form");
  if (editTaskForm) {
    const titleInput = document.getElementById("edit-task-title-input");
    const descInput = document.getElementById("edit-task-desc-input");
    const statusSelect = document.getElementById("edit-select-status");

    titleInput.value = task.title;
    descInput.value = task.description;
    statusSelect.value = task.status;

    document
      .getElementById("save-task-changes-btn")
      .addEventListener("click", () => {
        saveTaskChanges(task.id);
      });

    document.getElementById("delete-task-btn").addEventListener("click", () => {
      deleteTask(task.id); // Assume a function for deleting a task
      toggleModal(false, elements.editTaskModal);
      refreshTasksUI();
    });
  }

  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}

function saveTaskChanges(taskId) {
  // Get new user inputs
  const newTitle = document.getElementById("edit-task-title-input").value;
  const newDesc = document.getElementById("edit-task-desc-input").value;
  const newStatus = document.getElementById("edit-select-status").value;

  const updatedTask = {
    id: taskId,
    title: newTitle,
    description: newDesc,
    status: newStatus,
    board: activeBoard,
  };

  // Update the task (presumably with a helper function)
  const success = updateTask(updatedTask); // Assume a function to update the task

  if (success) {
    toggleModal(false, elements.editTaskModal); // Close the modal
    refreshTasksUI(); // Refresh the UI to reflect changes
  }
}

/*************************************************************************************************************************************************/

document.addEventListener("DOMContentLoaded", function () {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem("showSideBar") === "true";
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem("light-theme") === "enabled";
  document.body.classList.toggle("light-theme", isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}
