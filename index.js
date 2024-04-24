// TASK: import helper functions from utils
// TASK: import initialData
import {
  getTask,
  createNewTask,
  patchTask,
  putTask,
  deleteTask,
} from "./utils/taskFunctions.js";
import { initialData } from "./initialData";
/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem("tasks")) {
    localStorage.setItem("tasks", JSON.stringify(initialData));
    localStorage.setItem("showSideBar", "true");
  } else {
    console.log("Data already exists in localStorage");
  }
}
initializeData();

// TASK: Get elements from the DOM
const elements = {
  // Navigation Sidebar: Contains the logo, navigation links for boards, and theme toggle.
  boardsNavLinksDiv: document.getElementById("boards-nav-links-div"),
  themeSwitch: document.getElementById("switch"),
  hideSideBarBtn: document.getElementById("hide-side-bar-btn"),
  showSideBarBtn: document.getElementById("show-side-bar-btn"),
  sideBar: document.querySelector(".side-bar"),
  sideBarBottom: document.querySelector(".side-bar-bottom"),

  headerBoardName: document.getElementById("header-board-name"),
  dropDownBtn: document.getElementById("dropdownBtn"),
  createNewTaskBtn: document.getElementById("add-new-task-btn"),
  deleteBoardBtn: document.getElementById("deleteBoardBtn"),
  editBoardBtn: document.getElementById("edit-board-btn"),

  columnDivs: document.querySelectorAll(",column-div"),

  modalWindow: document.getElementById("new-task-modal-window"),
  titleInput: document.getElementById("title-input"),
  descriptionInput: document.getElementById("desc-input"),
  selectStatus: document.getElementById("select-status"),
  createTaskBtn: document.getElementById("create-task-btn"),
  cancelAddTaskBtn: document.getElementById("cancel-add-task-btn"),

  editTaskModal: document.querySelector(".edit-task-modal-window"),
  editTaskForm: document.getElementById("edit-task-form"),
  editTaskTitleInput: document.getElementById("edit-task-title-input"),
  editBtn: document.getElementById("edit-btn"),
  editTaskDescInput: document.getElementById("edit-task-desc-input"),
  editSelectStatus: document.getElementById("edit-select-status"),
  saveTaskChangesBtn: document.getElementById("save-task-changes-btn"),
  cancelEditBtn: document.getElementById("cancel-edit-btn"),
  deleteTaskBtn: document.getElementById("delete-task-btn"),

  //filter div
  filterDiv: document.getElementById("filterDiv"),
  };

let activeBoard = "";

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks(); //retrieve a list of tasks
  //extracts unique board names from tasks
  const boards = [...new Set(tasks.map((task) => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = localStorageBoard ? localStorageBoard : boards[0];
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ""; // Clears the container

  boards.forEach((board) => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");

    boardElement.onclick = () => {
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board; //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    };
    boardsContainer.appendChild(boardElement);
  });
}

// const selectStatusoption = elements.selectStatus.options[selectedIndex].value;
const statusSelection = {
  todo: "TODO",
  doing: "DOING",
  done: "DONE",
}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter((task) => task.board === boardName);


// Ensure the column titles are set outside of this function or correctly initialized before this function runs

elements.columnDivs.forEach((column) => {
  const status = column.getAttribute("data-status");
    const statusSelections = statusSelection[status];
  // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${statusSelections}</h4>
                        </div>`;

  const tasksContainer = document.createElement("div");
  column.appendChild(tasksContainer);

  filteredTasks
    .filter((task) => task.status === status)
    .forEach((task) => {
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute("data-task-id", task.id);

      // Listen for a click event on each task and open a modal
      taskElement.onclick = () => {
         openEditTaskModal(task);
      };
      tasksContainer.appendChild(taskElement);
    });
});
}

function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll(".board-btn").foreach((btn) => {
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
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute("data-task-id", task.id);

  tasksContainer.appendChild(taskElement);
}

function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById("cancel-edit-btn");
  cancelEditBtn.onclick = () => toggleModal(false, elements.editTaskModal);
   // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById("cancel-add-task-btn");
  cancelAddTaskBtn.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });
  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.onclick = () => toggleSidebar(false);
  elements.showSideBarBtn.onclick = () => toggleSidebar(true);

  // Theme switch event listener
  elements.themeSwitch.addEventListener("change", toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener("click", () => {
    toggleModal(true);
    elements.filterDiv.style.display = "block"; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener("submit", (event) => {
    addTask(event);
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? "block" : "none";
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); //prevents default form submission

  //Assign user input to the task object
  const task = {
    board: activeBoard,
    description: elements.descriptionInput.value,
    id: localStorage.getItem("id"),
    status: elements.selectStatus.value,
    title: elements.titleInput.value,
  };
  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
    event.target.reset();
    refreshTasksUI();
  }
}

function toggleSidebar(show) {
  const sidebar = document.getElementById("side-bar-div");
  const mainContent = document.getElementById("layout");

  if (show) {
    sidebar.style.display = "block";
    mainContent.classList.remove("expanded");
  } else {
    sidebar.style.display = "none";
    mainContent.classList.add("expanded");
  }
}

function toggleTheme() {
  const isLightTheme = document.body.classList.toggle("light-theme");
  localStorage.setItem("light-theme", isLightTheme ? "enabled" : "disabled");
}

function openEditTaskModal(task) {
  // Set task details in modal inputs
  // Get button elements from the task modal
   function styleActiveBoard(boardName) {
    document.querySelectorAll('.board-btn').forEach(btn => {
      if (btn.textContent === boardName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

function toggleTheme() {}

function openEditTaskModal(task) {
  // Set task details in modal inputs
const editTaskForm = document.getElementById("edit-task-form");

  // Get button elements from the task modal

  // Call saveTaskChanges upon click of Save Changes button

  // Delete task using a helper function and close the task modal

  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}

function saveTaskChanges(taskId) {
  // Get new user inputs

  // Create an object with the updated task details

  // Update task using a hlper functoin

  // Close the modal and refresh the UI to reflect the changes

 function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
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
