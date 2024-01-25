<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const newListName = ref('');
const newTask = ref({ title: '', description: '', status: 'not-done' });
const taskLists = ref([]);
const editingTaskIndex = ref(null);
const editedTask = ref({ title: '', description: '', status: '' });

const addTaskList = () => {
  if (newListName.value.trim() !== '') {
    taskLists.value.push({
      name: newListName.value,
      tasks: [],
    });
    newListName.value = '';
  }
};

const removeTaskList = (index) => {
  taskLists.value.splice(index, 1);
};

const addTask = (listIndex) => {
  if (newTask.value.title.trim() !== '') {
    taskLists.value[listIndex].tasks.push({
      title: newTask.value.title,
      description: newTask.value.description,
      status: newTask.value.status,
    });
    newTask.value = { title: '', description: '', status: 'not-done' };
  }
};

const removeTask = (listIndex, taskIndex) => {
  taskLists.value[listIndex].tasks.splice(taskIndex, 1);
};

const startEditingTask = (listIndex, taskIndex) => {
  editingTaskIndex.value = taskIndex;
  editedTask.value.title = taskLists.value[listIndex].tasks[taskIndex].title;
  editedTask.value.description = taskLists.value[listIndex].tasks[taskIndex].description;
  editedTask.value.status = taskLists.value[listIndex].tasks[taskIndex].status;
};

const saveEditedTask = (listIndex, taskIndex) => {
  taskLists.value[listIndex].tasks[taskIndex].title = editedTask.value.title;
  taskLists.value[listIndex].tasks[taskIndex].description = editedTask.value.description;
  taskLists.value[listIndex].tasks[taskIndex].status = editedTask.value.status;
  cancelEditingTask();
};

const cancelEditingTask = () => {
  editingTaskIndex.value = null;
  editedTask.value = { title: '', description: '', status: '' };
};

const isModalVisible = ref(false);
const isLoginVisible = ref(true);
const loginData = ref({ email: '', password: '' });
const registerData = ref({ email: '', password: '' });

const showLoginModal = () => {
  isModalVisible.value = true;
  isLoginVisible.value = true;
};

const showRegisterModal = () => {
  isModalVisible.value = true;
  isLoginVisible.value = false;
};

const closeModal = () => {
  isModalVisible.value = false;
};

const login = () => {
  //logika logowania
  console.log('Logowanie:', loginData.value);
  closeModal();
};

const register = () => {
  //logika rejestracji
  console.log('Rejestracja:', registerData.value);
  closeModal();
};

// Fetch data from db.json on component mount
onMounted(async () => {
  try {
    const response = await axios.get('../data/db.json');
    taskLists.value = response.data.taskLists;
  } catch (error) {
    console.error('Error fetching data from db.json', error);
  }
});
</script>

<template>
  <div id="app">
  <div class="centered-text margin-bottom-small">
    <h1>Zarządzanie Zadaniami</h1>
  </div>

  <button @click="showLoginModal">Zaloguj się</button>
    <button @click="showRegisterModal">Zarejestruj się</button>

    <!-- Modal -->
    <div v-if="isModalVisible" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeModal">&times;</span>
        <div v-if="isLoginVisible">
          <h2>Logowanie</h2>
          <form @submit.prevent="login">
            <!-- Formularz logowania -->
            <label>Email: <input v-model="loginData.email" type="text" /></label>
            <label>Hasło: <input v-model="loginData.password" type="password" /></label>
            <button type="submit">Zaloguj się</button>
          </form>
        </div>
        <div v-else>
          <h2>Rejestracja</h2>
          <form @submit.prevent="register">
            <!-- Formularz rejestracji -->
            <label>Email: <input v-model="registerData.email" type="text" /></label>
            <label>Hasło: <input v-model="registerData.password" type="password" /></label>
            <button type="submit">Zarejestruj się</button>
          </form>
        </div>
      </div>
    </div>
  
  <div class="kontener1 centered-text text-white">
    <label>Dodaj nową listę zadań: ‎ </label>
    <input v-model="newListName" @keyup.enter="addTaskList" />
    <button @click="addTaskList">Dodaj</button>
  </div>

    <div>
      <h2 class="text-white">Twoje listy zadań:</h2>
      <ul>
        <li v-for="(list, index) in taskLists" :key="index">
          {{ list.name }}
          <button @click="removeTaskList(index)">Usuń</button>
          <div class="margin-bottom-small">
            <label>Dodaj nowe zadanie: </label>
            <input v-model="newTask.title" placeholder="Tytuł" />
            <textarea v-model="newTask.description" placeholder="Opis"></textarea>
            <select v-model="newTask.status">
              <option value="not-done">Niezrobione</option>
              <option value="in-progress">W toku</option>
              <option value="completed">Zakończone</option>
            </select>
            <button @click="addTask(index)">Dodaj</button>
          </div>
          <ul>
            <li class="task" v-for="(task, taskIndex) in list.tasks" :key="taskIndex">
              <span v-if="taskIndex !== editingTaskIndex">
                <strong>{{ task.title }}</strong>
                <p>{{ task.description }}</p>
                <p>Status: {{ task.status }}</p>
                <button @click="startEditingTask(index, taskIndex)">Edytuj</button>
                <button @click="removeTask(index, taskIndex)">Usuń</button>
              </span>
              <span v-else>
                <input v-model="editedTask.title" placeholder="Tytuł" />
                <textarea v-model="editedTask.description" placeholder="Opis"></textarea>
                <select v-model="editedTask.status">
                  <option value="not-done">Niezrobione</option>
                  <option value="in-progress">W toku</option>
                  <option value="completed">Zakończone</option>
                </select>
                <button @click="saveEditedTask(index, taskIndex)">Zapisz</button>
                <button @click="cancelEditingTask">Anuluj</button>
              </span>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>