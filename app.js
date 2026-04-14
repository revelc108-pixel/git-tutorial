(() => {
  const STORAGE_KEY = "todo-app-items";

  const input = document.getElementById("todoInput");
  const addBtn = document.getElementById("addBtn");
  const list = document.getElementById("todoList");
  const counter = document.getElementById("counter");
  const footer = document.getElementById("footer");
  const emptyState = document.getElementById("emptyState");
  const clearCompletedBtn = document.getElementById("clearCompleted");
  const filterBtns = document.querySelectorAll(".filter-btn");

  let todos = loadTodos();
  let currentFilter = "all";

  function loadTodos() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function addTodo(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    todos.unshift({ id: generateId(), text: trimmed, completed: false });
    saveTodos();
    render();
    input.value = "";
    input.focus();
  }

  function toggleTodo(id) {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      saveTodos();
      render();
    }
  }

  function deleteTodo(id) {
    const item = list.querySelector(`[data-id="${id}"]`);
    if (item) {
      item.classList.add("removing");
      item.addEventListener("animationend", () => {
        todos = todos.filter((t) => t.id !== id);
        saveTodos();
        render();
      });
    }
  }

  function clearCompleted() {
    const completedItems = list.querySelectorAll(".todo-item.completed");
    if (completedItems.length === 0) return;

    completedItems.forEach((item) => item.classList.add("removing"));

    setTimeout(() => {
      todos = todos.filter((t) => !t.completed);
      saveTodos();
      render();
    }, 250);
  }

  function getFilteredTodos() {
    switch (currentFilter) {
      case "active":
        return todos.filter((t) => !t.completed);
      case "completed":
        return todos.filter((t) => t.completed);
      default:
        return todos;
    }
  }

  function createTodoElement(todo) {
    const li = document.createElement("li");
    li.className = `todo-item${todo.completed ? " completed" : ""}`;
    li.dataset.id = todo.id;

    li.innerHTML = `
      <div class="checkbox" role="checkbox" aria-checked="${todo.completed}" tabindex="0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <span class="todo-text">${escapeHTML(todo.text)}</span>
      <button class="delete-btn" aria-label="删除">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;

    const checkbox = li.querySelector(".checkbox");
    checkbox.addEventListener("click", () => toggleTodo(todo.id));
    checkbox.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleTodo(todo.id);
      }
    });

    li.querySelector(".delete-btn").addEventListener("click", () => deleteTodo(todo.id));

    return li;
  }

  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function render() {
    const filtered = getFilteredTodos();
    const activeCount = todos.filter((t) => !t.completed).length;

    list.innerHTML = "";
    filtered.forEach((todo) => list.appendChild(createTodoElement(todo)));

    counter.textContent = `${activeCount} 项待办`;

    const hasItems = todos.length > 0;
    footer.classList.toggle("hidden", !hasItems);
    emptyState.classList.toggle("hidden", filtered.length > 0);

    const hasCompleted = todos.some((t) => t.completed);
    clearCompletedBtn.style.visibility = hasCompleted ? "visible" : "hidden";
  }

  // Event Listeners
  addBtn.addEventListener("click", () => addTodo(input.value));

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTodo(input.value);
  });

  clearCompletedBtn.addEventListener("click", clearCompleted);

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  render();
})();
