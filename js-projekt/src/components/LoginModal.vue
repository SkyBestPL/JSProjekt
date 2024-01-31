<!-- LoginModal.vue -->
<template>
    <div class="modal">
      <div class="modal-content">
        <span class="close" @click="closeModal">&times;</span>
            <div v-if="isLoginVisible">
            <h2>Logowanie</h2>
            <form @submit.prevent="login">
                <label>Email: <input v-model="loginData.email" type="text" class="custom-input " /></label>
                <label>Hasło: <input v-model="loginData.password" type="password" class="custom-input"/></label>
                <button type="submit" style="margin-left: 10px;">Zaloguj się</button>
            </form>
            </div>
            <div v-else>
            <h2>Rejestracja</h2>
            <form @submit.prevent="register">
                <label>Imię: <input v-model="registerData.firstName" type="text" class="custom-input"/></label>
                <label>Nazwisko: <input v-model="registerData.lastName" type="text" class="custom-input"/></label>
                <label>Email: <input v-model="registerData.email" type="text" class="custom-input"/></label>
                <label>Hasło: <input v-model="registerData.password" type="password" class="custom-input"/></label>
                <label>Pseudonim: <input v-model="registerData.nickname" type="text" class="custom-input"/></label>
                <button type="submit">Zarejestruj się</button>
            </form>
            </div>
      </div>
    </div>
</template>
  
<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios';
import { defineEmits } from 'vue';

const emit=defineEmits(['logowanie'],['close'],['rejestracja']);

let { isModalVisible, isLoginVisible, isLoggedIn } = defineProps(['isModalVisible', 'isLoginVisible', 'isLoggedIn']);

const users = ref([]);
const taskLists = ref([]);
const loginData = ref({ email: '', password: '' });
const registerData = ref({ firstName: '', lastName: '', email: '', password: '', nickname: '' });
const userIdCounter = ref([]);
const loggedInUserId = ref([]);

const login = () => {
  const user = findUserByEmail(loginData.value.email);
  if (user && user.password === loginData.value.password) {
    isLoggedIn = true;
    loggedInUserId.value = user.id;
    emit("logowanie",{loggedInUserId: loggedInUserId.value, loginData: loginData})
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
      taskListIds: [],
      ifAdmin: 0
    };
    emit("rejestracja",{newUser: newUser})
  } else {
    console.log('Użytkownik już istnieje');
  }
};

const closeModal = () => {
    emit("close")
};

const getNextUserId = () => {
  const id = userIdCounter.value;
  return id;
};

const findUserByEmail = (email) => {
  return users.value.find(user => user.email === email);
};

onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:3001');
    userIdCounter.value = response.data.userIdCounter;
    taskLists.value = response.data.taskLists;
    users.value = response.data.users || [];
    console.log('Users:', users.value); 
  } catch (error) {
    console.error('Error fetching data', error);
  }
});
</script>