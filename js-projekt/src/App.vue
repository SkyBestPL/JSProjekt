

<template>
  <div id="app">
    <div class="centered-text margin-bottom-small">
      <h1>Zarządzanie Zadaniami</h1>
    </div>

    <button @click="showLoginModal" v-if="!isLoggedIn">Zaloguj się</button>
    <button @click="showRegisterModal" v-if="!isLoggedIn">Zarejestruj się</button>

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
            <label>Imię: <input v-model="registerData.firstName" type="text" /></label>
            <label>Nazwisko: <input v-model="registerData.lastName" type="text" /></label>
            <label>Email: <input v-model="registerData.email" type="text" /></label>
            <label>Hasło: <input v-model="registerData.password" type="password" /></label>
            <label>Pseudonim: <input v-model="registerData.nickname" type="text" /></label>
            <button type="submit">Zarejestruj się</button>
          </form>
        </div>
      </div>
    </div>

    <button @click="logout" v-if="isLoggedIn">Wyloguj się</button>
    <div v-if="isLoggedIn">
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
              <select v-model="newTask.assignedTo">
                <option value="">Brak przypisania</option>
                <option v-for="user in users" :value="user.id">{{ user.firstName }} {{ user.lastName }}</option>
              </select>


              <button @click="addTask(index)">Dodaj</button>
            </div>
            <ul>
              <li class="task" v-for="(task, taskIndex) in list.tasks" :key="taskIndex">
                <span v-if="taskIndex !== editingTaskIndex">
                  <strong>{{ task.title }}</strong>
                  <p>{{ task.description }}</p>
                  <p>Status: {{ task.status }}</p>
                  <p v-if="task.assignedTo">Przypisane do: {{ findUserById(task.assignedTo).firstName }} {{ findUserById(task.assignedTo).lastName }}</p>
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
                  <select v-model="editedTask.assignedTo">
                    <option value="">Brak przypisania</option>
                    <option v-for="user in users" :value="user.id">{{ user.firstName }} {{ user.lastName }}</option>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const newListName = ref('');
const newTask = ref({ title: '', description: '', status: 'not-done', assignedTo: '' });
const taskLists = ref([]);
const editingTaskIndex = ref(null);
const editedTask = ref({ title: '', description: '', status: '', assignedTo: '' });
const isModalVisible = ref(false);
const isLoginVisible = ref(true);
const loginData = ref({ email: '', password: '' });
const registerData = ref({ firstName: '', lastName: '', email: '', password: '', nickname: '' });
const isLoggedIn = ref(false);
const users = ref([]);

const updateServerData = async () => {
  try {
    await axios.post('http://localhost:3001', { taskLists: taskLists.value, users: users.value });
  } catch (error) {
    console.error('Error updating data on the server', error);
  }
};

const addTaskList = () => {
  if (newListName.value.trim() !== '') {
    taskLists.value.push({
      name: newListName.value,
      tasks: [],
    });
    newListName.value = '';
    updateServerData();
  }
};

const removeTaskList = (index) => {
  taskLists.value.splice(index, 1);
  updateServerData();
};

const addTask = (listIndex) => {
  if (newTask.value.title.trim() !== '') {
    taskLists.value[listIndex].tasks.push({
      title: newTask.value.title,
      description: newTask.value.description,
      status: newTask.value.status,
      assignedTo: newTask.value.assignedTo,
    });
    newTask.value = { title: '', description: '', status: 'not-done', assignedTo: '' };
    updateServerData();
  }
};

const removeTask = (listIndex, taskIndex) => {
  taskLists.value[listIndex].tasks.splice(taskIndex, 1);
  updateServerData();
};

const saveEditedTask = (listIndex, taskIndex) => {
  taskLists.value[listIndex].tasks[taskIndex].title = editedTask.value.title;
  taskLists.value[listIndex].tasks[taskIndex].description = editedTask.value.description;
  taskLists.value[listIndex].tasks[taskIndex].status = editedTask.value.status;
  taskLists.value[listIndex].tasks[taskIndex].assignedTo = editedTask.value.assignedTo;
  updateServerData();
};

const cancelEditingTask = () => {
  editingTaskIndex.value = null;
  editedTask.value = { title: '', description: '', status: '', assignedTo: '' };
};

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

const logout = () => {
  isLoggedIn.value = false;
};

const login = () => {
  const user = findUserByEmail(loginData.value.email);
  if (user && user.password === loginData.value.password) {
    isLoggedIn.value = true;
    closeModal();
  } else {
    console.log('Nieprawidłowe dane logowania');
  }
};

const register = () => {
  const existingUser = findUserByEmail(registerData.value.email);
  if (!existingUser) {
    const newUser = {
      id: getNextUserId(),
      firstName: registerData.value.firstName,
      lastName: registerData.value.lastName,
      email: registerData.value.email,
      password: registerData.value.password,
      nickname: registerData.value.nickname,
    };
    users.value.push(newUser);
    updateServerData();
    closeModal();
  } else {
    console.log('Użytkownik już istnieje');
  }
};

const userIdCounter = ref(1);
const getNextUserId = () => {
  const id = userIdCounter.value;
  userIdCounter.value += 1;
  return id;
};

const findUserByEmail = (email) => {
  return users.value.find(user => user.email === email);
};

const findUserById = (id) => {
  return users.value.find(user => user.id === id);
};

onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:3001');
    taskLists.value = response.data.taskLists;
    users.value = response.data.users || [];
    console.log('Users:', users.value); 
  } catch (error) {
    console.error('Error fetching data', error);
  }
});

</script>
