const form = document.getElementById('task-form');
    const container = document.getElementById('task-container');
    const themeToggle = document.getElementById('theme-toggle');
    const filterCategory = document.getElementById('filter-category');
    const filterPriority = document.getElementById('filter-priority');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let isDark = localStorage.getItem('theme') === 'dark';

    if (isDark) {
      document.body.classList.add('dark');
      themeToggle.textContent = '☀️';
    }

    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      isDark = document.body.classList.contains('dark');
      themeToggle.textContent = isDark ? '☀️' : '🌙';
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('task-title').value;
      const category = document.getElementById('task-category').value;
      const priority = document.getElementById('task-priority').value;
      const newTask = { title, category, priority, id: Date.now() };
      tasks.push(newTask);
      saveTasks();
      renderTasks();
      form.reset();
    });

    function renderTasks() {
      container.innerHTML = '';
      let filteredTasks = tasks.filter(task => {
        return (filterCategory.value === 'All' || task.category === filterCategory.value) &&
               (filterPriority.value === 'All' || task.priority === filterPriority.value);
      });

      filteredTasks.forEach(task => {
        const div = document.createElement('div');
        div.className = 'task';
        div.draggable = true;
        div.dataset.id = task.id;
        div.dataset.priority = task.priority;

        const info = document.createElement('div');
        info.innerHTML = `<strong>${task.title}</strong> <em>[${task.category}]</em>`;

        const btnGroup = document.createElement('div');
        btnGroup.className = 'task-buttons';

        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.onclick = () => deleteTask(task.id);

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.className = 'edit';
        editBtn.onclick = () => editTask(task);

        btnGroup.appendChild(editBtn);
        btnGroup.appendChild(delBtn);

        div.appendChild(info);
        div.appendChild(btnGroup);
        container.appendChild(div);

        div.addEventListener('dragstart', dragStart);
      });
    }

    let dragSrcEl = null;

    function dragStart(e) {
      dragSrcEl = e.target;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', e.target.dataset.id);
    }

    container.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });

    container.addEventListener('drop', (e) => {
      e.preventDefault();
      const draggedId = e.dataTransfer.getData('text/plain');
      const dropTarget = e.target.closest('.task');
      if (!dropTarget || draggedId === dropTarget.dataset.id) return;
      const draggedIndex = tasks.findIndex(t => t.id == draggedId);
      const targetIndex = tasks.findIndex(t => t.id == dropTarget.dataset.id);
      const [movedTask] = tasks.splice(draggedIndex, 1);
      tasks.splice(targetIndex, 0, movedTask);
      saveTasks();
      renderTasks();
    });

    function deleteTask(id) {
      tasks = tasks.filter(t => t.id !== id);
      saveTasks();
      renderTasks();
    }

    function editTask(task) {
      const title = prompt('Edit title:', task.title);
      if (title !== null) {
        task.title = title.trim();
        saveTasks();
        renderTasks();
      }
    }

    function saveTasks() {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    filterCategory.addEventListener('change', renderTasks);
    filterPriority.addEventListener('change', renderTasks);

    renderTasks();