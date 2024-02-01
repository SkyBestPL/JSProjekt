<template>
  <div id="app">
    <div class="centered-text margin-bottom-small">
      <h1 class="Title" >Zarządzanie Zadaniami</h1>
    </div>

    <div class="button-container" style="text-align: center;">
      <button @click="showLoginModal" v-if="!isLoggedIn">Zaloguj się</button>
      <button @click="showRegisterModal" v-if="!isLoggedIn">Zarejestruj się</button>
      <button style="margin-top:10px " @click="logout" v-if="isLoggedIn">Wyloguj się</button>
      <div v-if="isLoggedIn" class="user-info">
        <p style="text-align: center; font-size: large;" >Zalogowano jako: <b>{{ getCurrentUser().firstName }} {{ getCurrentUser().lastName }}</b> ({{ getCurrentUser().nickname }})</p>
      </div>
    </div>

    <!-- Komponent LoginModal -->
    <div v-if="isModalVisible">
      <LoginModal :isModalVisible="isModalVisible" :isLoginVisible="isLoginVisible" :isLoggedIn="isLoggedIn" @logowanie="handleLogin" @close="handleClose" @rejestracja="handleRegister"/>
    </div>

    <div class="button-container" v-if="isLoggedIn">
      <span v-if="getCurrentUser().ifAdmin == 1" class="kontener2 centered-text text-white">
        <div class="kontener1 centered-text text-white">
          <label style="font-size: large;" >Dodaj nową listę zadań: ‎ </label>
          <input v-model="newListName" @keyup.enter="addTaskList" class="custom-input"/>
          <button @click="addTaskList" style="margin-left: 5px;">Dodaj</button>
        </div>
      </span>

      <div>
        <h2 class="text-white" style="text-align: center;">Dostępne listy zadań:</h2>
        <ul>
          <li v-for="(list, index) in taskLists" :key="index">
            <b style="color:#000000 ; font-size: x-large;">{{ list.name }}</b>
            <button v-if="getCurrentUser().ifAdmin == 1 || getCurrentUser().id == list.idOwner" @click="showListModal" style="float: right;">Edytuj Listę</button>

          <div v-if="isModalListVisible">
            <div class="modal">
              <div class="modal-content">
                <span class="close" @click="closeListModal">&times;</span>
                    <div style="margin-top: 10px;">

                      <span v-if="getCurrentUser().ifAdmin == 1">
                        <button @click="removeTaskList(index)">Usuń listę</button>
                        <br>
                        <span v-if="list.idOwner != null">
                          <p style="font-size: large;" >Właściciel listy: <b class="owner">{{ findUserById(list.idOwner).nickname }}</b></p>
                        </span> 
                        <span v-if="list.idAssigned != null">
                          <p style="font-size: large;" >Przypisani do listy: 
                            <span v-for="moderatorId in list.idAssigned" :key="moderatorId">
                              <b style="color:black">{{ findUserById(moderatorId).nickname }}</b>,
                            </span>
                          </p>
                        </span>
                        <br>
                        <select v-model="selectedOwnerForAssignment">
                          <option v-for="user in users" :value="user.id">{{ user.firstName }} {{ user.lastName }}</option>
                        </select>
                        <button @click="assignOwnerToTaskList(list.id, selectedOwnerForAssignment)">Przypisz właściciela</button>
                        <br>
                        <select v-model="selectedListForDelete">
                          <option v-for="user in users" :value="user.id">{{ user.firstName }} {{ user.lastName }}</option>
                        </select>
                        <button @click="assignTaskListToUser(list.id, selectedListForDelete)">Przypisz użytkownika</button>
                        <br>
                        <select v-model="selectedUserForDeleteFromList">
                            <option value="">Wybierz użytkownika</option>
                            <option v-for="user in list.idAssigned" :value="user">
                                {{ findUserById(user) && findUserById(user).firstName }} {{ findUserById(user) && findUserById(user).lastName }}
                            </option>
                        </select>
                        <button @click="removeUserFromTaskList(selectedUserForDeleteFromList, list.id)">Usuń użytkownika z listy zadań</button>
                      </span>
                    </div>
                    
                    <div class="margin-bottom-small">
                      <div v-if="getCurrentUser().id == list.idOwner || getCurrentUser().ifAdmin == 1">
                        <label style="margin-bottom: 10px">Dodaj nowe zadanie: </label>
                        <div class="input-container" style="width: 100%;">
                          <input v-model="newTask.title" placeholder="Tytuł" class="custom-input"/>
                          <textarea v-model="newTask.description" placeholder="Opis" class="custom-input"></textarea>
                        </div>
                        <select v-model="newTask.status">
                          <option value="not-done">Niezrobione</option>
                          <option value="in-progress">W toku</option>
                          <option value="completed">Zakończone</option>
                        </select>
                        <select v-model="newTask.assignedTo">
                          <option value="">Brak przypisania</option>
                          <option v-for="user in users" :value="user.id">{{ user.firstName }} {{ user.lastName }}</option>
                        </select>
                        <button @click="addTask(index); toggleAddingVisibility(list)">Dodaj</button>
                      </div>
                    </div>

              </div>
            </div>
          </div>

            <span v-if="list.idOwner != null">
              <p style="font-size: large;" >Właściciel listy: <b class="owner">{{ findUserById(list.idOwner).nickname }}</b></p>
            </span> 

            <ul>
              <li class="task" v-for="task in list.tasks" :key="task.id">
                <span v-if="task.id !== editingTaskIndex && task.isDetailsVisible != false">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="font-size: larger;" >{{ task.title }}</strong>
                    <button style="margin-left: 10px;" @click="toggleDetailsVisibility(task)">Pokaż/Schowaj szczegóły</button>
                  </div>
                  <p v-if="task.isDetailsVisible" style="font-size: large;" >Opis: {{ task.description }}</p>
                  <p style="font-size: large;" >Status: {{ task.status }}</p>
                  <p v-if="task.assignedTo" style="font-size: large;" >Przypisane do: {{ findUserById(task.assignedTo).firstName }} {{ findUserById(task.assignedTo).lastName }}</p>
                  <span v-if="getCurrentUser().ifAdmin == 1 || getCurrentUser().id == list.idOwner">
                    <button @click="startEditingTask(index, task.id)">Edytuj</button>
                  </span>
                </span>
                
                <span v-else-if="task.id == editingTaskIndex && task.isDetailsVisible != false">
                <div class="modal">
                  <div class="modal-content">
                    <input v-model="editedTask.title" placeholder="Tytuł" />
                    <button style="margin-left: 10px" @click="removeTask(index, task.id)">Usuń</button>
                    <textarea v-model="editedTask.description" placeholder="Opis" class="custom-input"></textarea>
                    <select v-model="editedTask.status">
                      <option value="not-done">Niezrobione</option>
                      <option value="in-progress">W toku</option>
                      <option value="completed">Zakończone</option>
                    </select>

                    <select v-model="editedTask.assignedTo">
                      <option value="">Brak przypisania</option>
                      <option v-for="userId in list.idAssigned" :value="userId">
                        {{ findUserById(userId).firstName }} {{ findUserById(userId).lastName }}
                      </option>
                    </select>

                    <button @click="saveEditedTask(index, task.id)">Zapisz</button>
                    <button @click="cancelEditingTask">Anuluj</button>
                  </div>
                </div>
              </span>

                <span v-else>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="font-size: larger;" >{{ task.title }}</strong>
                    <button style="margin-left: 10px; " @click="toggleDetailsVisibility(task)">Pokaż/Schowaj szczegóły</button>
                  </div>
                </span>
              </li>
            </ul>

            <span v-if="list.idAssigned != null">
              <p style="font-size: large;" >Przypisani do listy: 
                <span v-for="moderatorId in list.idAssigned" :key="moderatorId">
                  <b style="color:black">{{ findUserById(moderatorId).nickname }}</b>,
                </span>
              </p>
            </span>

          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import LoginModal from './components/LoginModal.vue'
import { ref, onMounted } from 'vue';
import axios from 'axios';

const newListName = ref('');
let newTask = {
  id: '',
  title: '',
  description: '',
  status: 'not-done',
  assignedTo: '',
  isDetailsVisible: false,
  isAddingVisible: false
};

const taskLists = ref([]);
const editingTaskIndex = ref(null);
const editedTask = ref({ id: '', title: '', description: '', status: '', assignedTo: '' });
const isModalVisible = ref(false);
const isModalListVisible = ref(false);
const isLoginVisible = ref(true);
const loginData = ref({ email: '', password: '' });
const registerData = ref({ firstName: '', lastName: '', email: '', password: '', nickname: '' });
const isLoggedIn = ref(false);
const users = ref([]);
const taskIdCounter = ref([]);
const userIdCounter = ref([]);
const listIdCounter = ref([]);
const loggedInUserId = ref([]);
const selectedUserForAssignment = ref('');

//metoda dodawania nowej listy zadań
const addTaskList = () => {
  if (newListName.value.trim() !== '') {
    const idList = listIdCounter.value;
    taskLists.value.push({
      id: idList,
      idOwner: 1,
      name: newListName.value,
      idAssigned: [],
      tasks: [],
    });
    listIdCounter.value += 1;
    newListName.value = '';
    updateServerData();
  }
};

//metoda usuwania listy zadań
const removeTaskList = (index) => {
  taskLists.value.splice(index, 1);
  updateServerData();
};

//metoda dodawania listy zadań
const addTask = (listIndex) => {
  if (newTask.title.trim() !== '') {
    const taskId = taskIdCounter.value;
    const task = {
      id: taskId,
      title: newTask.title,
      description: newTask.description,
      status: newTask.status,
      assignedTo: newTask.assignedTo,
      isDetailsVisible: false,
      isAddingVisible: false
    };
    taskLists.value[listIndex].tasks.push(task);
    taskIdCounter.value += 1;
    newTask.title = '';
    newTask.description = '';
    newTask.status = 'not-done';
    newTask.assignedTo = '';
    updateServerData();
  }
};

//metoda usuwania zadania z listy
const removeTask = (listIndex, taskId) => {
  const list = taskLists.value[listIndex];
  const taskIndex = list.tasks.findIndex(task => task.id === taskId);
  if (taskIndex !== -1) {
    list.tasks.splice(taskIndex, 1);
    updateServerData();
  }
};

//metoda rozpoczęcia edycji zadania
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

//metoda zapisywania edytowanego zadania
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

//metoda anulowania edycji zadania
const cancelEditingTask = () => {
  editingTaskIndex.value = null;
  editedTask.value = { id: '', title: '', description: '', status: '', assignedTo: '' };
};

//metoda pokazania okna logowania
const showLoginModal = () => {
  isModalVisible.value = true;
  isLoginVisible.value = true;
};

//metoda pokazania okna rejestracji
const showRegisterModal = () => {
  isModalVisible.value = true;
  isLoginVisible.value = false;
};

//metoda pokazania okna edycji listy
const showListModal = () => {
  isModalListVisible.value = true;
};

//metoda zamknięcia okna modalnego
const closeModal = () => {
  isModalVisible.value = false;
};

//metoda zamknięcia okna edycji listy
const closeListModal = () => {
  isModalListVisible.value = false;
};

//metoda wylogowania użytkownika
const logout = () => {
  isLoggedIn.value = false;
};

//metoda znajdująca użytkownika po ID
const findUserById = (id) => {
  return users.value.find(user => user.id === id);
};

//metoda znajdująca listę po ID
const findListById = (id) => {
  return taskLists.value.find(list => list.id === id);
};

//metoda znajdująca zalogowanego użytkownika
const getCurrentUser = () => {
  return findUserById(loggedInUserId.value);
};

//metoda ukrywająca szczegóły zadania
const toggleDetailsVisibility = (task) => {
  task.isDetailsVisible = !task.isDetailsVisible;
  updateServerData();
};

//metoda ukrywająca okno dodawania zadania
const toggleAddingVisibility = (list) => {
  list.isAddingVisible = !list.isAddingVisible;
  updateServerData();
};

//przypisywanie właściciela do listy
const assignOwnerToTaskList = async (listId, userId) => {
  try {
    const Lista = findListById(listId);
    Lista.idOwner = userId;
    await updateServerData();
  } catch (error) {
    console.error('Error assigning owner to task list', error);
  }
};

//metoda przypisywania użytkownika do listy
const assignTaskListToUser = async (listId, userId) => {
  try {
    const user = findUserById(userId);
    const Lista = findListById(listId);
    
    if(!Lista.idAssigned.includes(userId)){
      Lista.idAssigned.push(userId);
    } else {
      console.log('User already assigned to list');
    }

    if (!user) {
      console.error('User not found');
      return;
    }

    if (!user.taskListIds.includes(listId)) {
      user.taskListIds.push(listId);
    } else {
      console.log('List already assigned to user');
    }

    await updateServerData();
  } catch (error) {
    console.error('Error assigning task list to user', error);
  }
};

//usuwanie użytkownika z listy
const removeUserFromTaskList = async (userId, listId) => {
  try {
    const list = findListById(listId);
    if (list) {
      const userIndex = list.idAssigned.indexOf(userId);
      if (userIndex !== -1) {
        list.idAssigned.splice(userIndex, 1);
        await updateServerData();
        removeTaskListFromUser(userId, listId);
      } else {
        console.log('User not found in the task list');
      }
    } else {
      console.log('Task list not found');
    }
  } catch (error) {
    console.error('Error removing user from task list', error);
  }
};

//usuwanie użytkownika z listy
const removeTaskListFromUser = async (userId, listId) => {
  try {
    const user = findUserById(userId);
    if (user) {
      const listIndex = user.taskListIds.indexOf(listId);
      if (listIndex !== -1) {
        user.taskListIds.splice(listIndex, 1);
        await updateServerData();
      } else {
        console.log('Task list not found in the user');
      }
    } else {
      console.log('User not found');
    }
  } catch (error) {
    console.error('Error removing task list from user', error);
  }
};

//obsługiwanie komponentu LoginModal
const handleLogin = (logData) => {
  console.log('Zalogowano');

  loggedInUserId.value = logData.loggedInUserId;
  isLoggedIn.value = true;
  loginData.value.email = logData.loginData.email;
  loginData.value.password = logData.loginData.password;
  closeModal();
};

const handleClose = () => {
  closeModal();
};

const handleRegister = (regData) => {
  console.log('Zarejestrowano');
  userIdCounter.value += 1;
  const newUser = {
      id: regData.newUser.id,
      firstName: regData.newUser.firstName,
      lastName: regData.newUser.lastName,
      email: regData.newUser.email,
      password: regData.newUser.password,
      nickname: regData.newUser.nickname,
      taskListIds: [],
      ifAdmin: 0
    };
    users.value.push(newUser);
    updateServerData();
    closeModal();
};

//aktualizacja danych na serwerze
const updateServerData = async () => {
  try {
    await axios.post('http://localhost:3001', { taskLists: taskLists.value, users: users.value, userIdCounter: userIdCounter.value, taskIdCounter: taskIdCounter.value, listIdCounter: listIdCounter.value });
  } catch (error) {
    console.error('Error updating data on the server', error);
  }
};

//inicjalizowanie danych po załadowaniu komponentu
onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:3001');
    userIdCounter.value = response.data.userIdCounter;
    taskIdCounter.value = response.data.taskIdCounter;
    listIdCounter.value = response.data.listIdCounter;
    taskLists.value = response.data.taskLists;
    users.value = response.data.users || [];
    console.log('Users:', users.value); 
  } catch (error) {
    console.error('Error fetching data', error);
  }
});
</script>