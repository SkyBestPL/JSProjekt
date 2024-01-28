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
              <li class="task" v-for="task in list.tasks" :key="task.id">
                <span v-if="task.id !== editingTaskIndex">
                  <strong>{{ task.title }}</strong>
                  <p>{{ task.description }}</p>
                  <p>Status: {{ task.status }}</p>
                  <p v-if="task.assignedTo">Przypisane do: {{ findUserById(task.assignedTo).firstName }} {{ findUserById(task.assignedTo).lastName }}</p>
                  <button @click="startEditingTask(index, task.id)">Edytuj</button>
                  <button @click="removeTask(index, task.id)">Usuń</button>
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
                  <button @click="saveEditedTask(index, task.id)">Zapisz</button>
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
let newTask = {
  id: '',
  title: '',
  description: '',
  status: 'not-done',
  assignedTo: ''
};


const taskLists = ref([]);
const editingTaskIndex = ref(null);
const editedTask = ref({ id: '', title: '', description: '', status: '', assignedTo: '' });
const isModalVisible = ref(false);
const isLoginVisible = ref(true);
const loginData = ref({ email: '', password: '' });
const registerData = ref({ firstName: '', lastName: '', email: '', password: '', nickname: '' });
const isLoggedIn = ref(false);
const users = ref([]);
const taskIdCounter = ref(0); // Inicjalizacja licznika ID dla zadań

// Metoda aktualizacji danych na serwerze
const updateServerData = async () => {
  try {
    await axios.post('http://localhost:3001', { taskLists: taskLists.value, users: users.value });
  } catch (error) {
    console.error('Error updating data on the server', error);
  }
};

// Metoda dodawania nowej listy zadań
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

// Metoda usuwania listy zadań
const removeTaskList = (index) => {
  taskLists.value.splice(index, 1);
  updateServerData();
};

const addTask = (listIndex) => {
  if (newTask.title.trim() !== '') {
    const taskId = taskIdCounter.value++; // Generowanie nowego ID dla zadania
    const task = {
      id: taskId,
      title: newTask.title,
      description: newTask.description,
      status: newTask.status,
      assignedTo: newTask.assignedTo,
    };
    taskLists.value[listIndex].tasks.push(task);
    newTask.title = ''; // Resetowanie pól nowego zadania
    newTask.description = '';
    newTask.status = 'not-done';
    newTask.assignedTo = '';
    updateServerData();
  }
};



// Metoda usuwania zadania z listy
const removeTask = (listIndex, taskId) => {
  const list = taskLists.value[listIndex];
  const taskIndex = list.tasks.findIndex(task => task.id === taskId);
  if (taskIndex !== -1) {
    list.tasks.splice(taskIndex, 1);
    updateServerData();
  }
};

// Metoda rozpoczęcia edycji zadania
const startEditingTask = (listIndex, taskId) => {
  const list = taskLists.value[listIndex];
  const task = list.tasks.find(task => task.id === taskId);
  if (task) {
    editingTaskIndex.value = taskId;
    editedTask.value.id = taskId;
    editedTask.value.title = task.title;
    editedTask.value.description = task.description;
    editedTask.value.status = task.status;
    editedTask.value.assignedTo = task.assignedTo;
  }
};

// Metoda zapisywania edytowanego zadania
const saveEditedTask = (listIndex, taskId) => {
  const list = taskLists.value[listIndex];
  const task = list.tasks.find(task => task.id === taskId);
  if (task) {
    task.title = editedTask.value.title;
    task.description = editedTask.value.description;
    task.status = editedTask.value.status;
    task.assignedTo = editedTask.value.assignedTo;
    updateServerData();
    cancelEditingTask();
  }
};

// Metoda anulowania edycji zadania
const cancelEditingTask = () => {
  editingTaskIndex.value = null;
  editedTask.value = { id: '', title: '', description: '', status: '', assignedTo: '' };
};

// Metoda pokazania okna logowania
const showLoginModal = () => {
  isModalVisible.value = true;
  isLoginVisible.value = true;
};

// Metoda pokazania okna rejestracji
const showRegisterModal = () => {
  isModalVisible.value = true;
  isLoginVisible.value = false;
};

// Metoda zamknięcia okna modalnego
const closeModal = () => {
  isModalVisible.value = false;
};

// Metoda wylogowania użytkownika
const logout = () => {
  isLoggedIn.value = false;
};

// Metoda logowania użytkownika
const login = () => {
  const user = findUserByEmail(loginData.value.email);
  if (user && user.password === loginData.value.password) {
    isLoggedIn.value = true;
    closeModal();
  } else {
    console.log('Nieprawidłowe dane logowania');
  }
};

// Metoda rejestracji użytkownika
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

// Metoda generująca kolejne unikalne ID użytkownika
const getNextUserId = () => {
  const id = users.value.length + 1;
  return id;
};

// Metoda znajdująca użytkownika po adresie email
const findUserByEmail = (email) => {
  return users.value.find(user => user.email === email);
};

// Metoda znajdująca użytkownika po ID
const findUserById = (id) => {
  return users.value.find(user => user.id === id);
};

// Metoda inicjalizująca dane po załadowaniu komponentu
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
