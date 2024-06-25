<template>
    <div>
        <div
            style="-webkit-app-region: drag; display: flex; justify-content: end; position: absolute; width: 100%; padding: 5px;">
            <div class="flex_center hover_dark hover_pointer title_bar_menu" style="-webkit-app-region: no-drag;"
                @click="minimize_window()">
                <img src="./assets/images/minimize.svg" alt="">
            </div>
            <div class="flex_center hover_dark hover_pointer title_bar_menu"
                style="-webkit-app-region: no-drag; margin-left: 2px;" @click="close_window()">
                <img src="./assets/images/close.svg" alt="">
            </div>
        </div>
        <login-view v-if="view_resolver == 'login-view'" @go_join="go_join" @go_find_email="go_find_email"></login-view>
        <welcome-view v-else-if="view_resolver == 'welcome-view'" :user_info="user_info" :config_data="config_data"
            @user_logout="user_logout" @go_profile_edit="go_profile_edit"></welcome-view>
        <join-view v-else-if="view_resolver == 'join-view'" @go_login="go_login" :user_info="user_info"></join-view>
        <find-email-view v-else-if="view_resolver == 'find-email-view'" @go_login="go_login"
            @go_join="go_join"></find-email-view>
        <profile-edit-view v-else-if="view_resolver == 'profile-edit-view'" :user_info="user_info" @go_welcome="go_welcome" @new_profile_image="new_profile_image"></profile-edit-view>
    </div>
</template>

<script>
import WelcomeView from './views/WelcomeView.vue';
import LoginView from './views/LoginView.vue';
import JoinView from './views/JoinView.vue';
import FindEmailView from './views/FindEmailView.vue';
import ProfileEditView from './views/ProfileEditView.vue';
import { getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";


export default {
    components: {
        LoginView,
        WelcomeView,
        JoinView,
        FindEmailView,
        ProfileEditView
    },
    data() {
        return {
            view_resolver: undefined,
            user_info: undefined,
        }
    },
    methods: {
        user_logout() {
            const auth = getAuth();
            signOut(auth).then(() => {
                // Sign-out successful.
            }).catch((error) => {
                // An error happened.
            });
        },
        async load_config_file() {
            const data = await window.electronAPI.getConfig();
            this.config_data = data;
        },
        go_join() {
            this.view_resolver = 'join-view'
        },
        go_login() {
            this.view_resolver = 'login-view'
        },
        minimize_window() {
            window.electronAPI.minimizeWindow();
        },
        close_window() { 
            window.electronAPI.closeWindow();
        },
        go_find_email() {
            this.view_resolver = 'find-email-view'
        },
        go_profile_edit() {
            this.view_resolver = 'profile-edit-view'
        },
        go_welcome() {
            this.view_resolver = 'welcome-view'
        },
        new_profile_image(ref) {
            console.log("gggg");
            // this.user_info.photoURL = 'https://firebasestorage.googleapis.com/v0/b/' + import.meta.env.VITE_FIREBASE_STOARGE_BUCKET + '/o/' + this.user_info.uid + '?alt=media&token=&t=' +Date.now()
            this.user_info.photoURL = ref;
        }
    },
    created() {
        this.load_config_file();
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            if (user) {
                this.user_info = {...getAuth().currentUser};
                setTimeout(() => {
                    if (getAuth().currentUser.photoURL != null) this.user_info.photoURL = getAuth().currentUser.photoURL;
                }, 333);
                setTimeout(() => {
                    if (getAuth().currentUser.photoURL != null) this.user_info.photoURL = getAuth().currentUser.photoURL;
                }, 666);
                setTimeout(() => {
                    if (getAuth().currentUser.photoURL != null) this.user_info.photoURL = getAuth().currentUser.photoURL;
                }, 1000);
                this.view_resolver = "welcome-view";
            } else {
                this.view_resolver = "login-view";
            }
        });
    }
}
</script>

<style scoped>.title_bar_menu:hover {
    background-color: rgba(0, 0, 0, 0.13);
}</style>
