<template>
    <div class="flex_center" style="background-color: white; height: 100vh">
        <!-- <div id="google_login_button" class="flex_center hover_dark hover_pointer" @click="google_login_button_click()">
            <img src="../assets/images/google.svg" alt="" width="20">
            <div style="margin-left: 10px;">
                구글 로그인
            </div>
        </div> -->
        <div style="min-width: 300px;">
            <div style="text-align: center; margin-bottom: 20px">
                글다리
            </div>
            <div style="margin-bottom: 10px;">
                <input class="display_block input_form" type="email" v-model="email" placeholder="이메일">
                <input class="display_block input_form" type="password" v-model="password" placeholder="비밀번호">
                <div class="flex_center hover_pointer hover_dark"
                    style="background-color: rgb(68, 87, 255); height: 40px; color: white; margin-bottom: 18px;"
                    @click="email_login_click()">
                    <span v-if="!login_pending">로그인</span>
                    <img v-else src="../assets/images/spinner1.svg" alt="" width="40">
                </div>
            </div>
            <div v-if="login_alert" class="flex_center" style="font-size: 14px; color: rgb(248, 37, 37); margin-bottom: 20px;">
                <img src="../assets/images/fail.svg" alt="" width="18"><span style="margin-left: 4px;">이메일과 비밀번호를 확인해 주세요</span>
            </div>
            <div style="font-size: 12px;">
                <div style="margin-bottom: 6px;">
                    <span style="color: rgba(0, 0, 0, 0.637)">서비스가 처음이신가요?</span><span class="hover_pointer"
                        style="text-decoration: underline; margin-left: 10px;" @click="$emit('go_join')">회원가입</span>
                </div>
                <div>
                    <span style="color: rgba(0, 0, 0, 0.637)">비밀번호를 잊으셨나요?</span><span class="hover_pointer"
                        style="text-decoration: underline; margin-left: 10px;" @click="$emit('go_find_email')">비밀번호 찾기</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { getAuth, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
/*
aa@aa.aa
aaaaaa
*/

export default {
    data() {
        return {
            email: '',
            password: '',
            login_pending: false,
            login_alert: false,
        }
    },
    methods: {
        async google_login_button_click() {

            const provider = new GoogleAuthProvider();
            const auth = getAuth();

            signInWithPopup(auth, provider);
        },
        async email_login_click() {
            if (this.login_pending == true) {
                return;
            }
            this.login_pending = true;
            signInWithEmailAndPassword(getAuth(), this.email, this.password)
                .then((userCredential) => {
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.log(errorCode, errorMessage);
                    this.login_alert = true;
                })
                .finally(() => {
                    this.login_pending = false;
                });
        }
    },
    created() {

    }
}
</script>

<style scoped>
#google_login_button {
    color: rgb(54, 54, 54);
    background-color: white;
    border: solid 0.5px rgb(228, 228, 228);
    border-radius: 10px;
    width: 75%;
    padding: 10px 0;
    max-width: 600px;
    box-shadow: 0px 1px 8px 1px rgba(0, 0, 0, 0.1);
}

.input_form {
    margin-bottom: 10px;
    width: 100%;
    height: 40px;
    padding: 0 14px;
    font-size: 14px;
    border: solid 1px rgba(0, 0, 0, 0.18);
    border-radius: 5px;
}

.input_form:focus {
    border: solid 1px rgba(0, 0, 0, 0.781);
}</style>
