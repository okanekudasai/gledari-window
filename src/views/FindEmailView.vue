<template>
    <div>
        <div class="flex_center" style="background-color: white; height: 100vh">
            <div style="min-width: 300px;">
                <div style="text-align: center; margin-bottom: 20px">
                    글다리
                </div>
                <div style="margin-bottom: 10px;">
                    <div style="margin-bottom: 10px;">
                        <input class="display_block input_form" type="email" v-model="email" placeholder="이메일">
                        <div v-if="email_possible == 1" class="input_alert"
                            style="font-size: 11px; color: rgb(233, 47, 47)">
                            이메일 형식을 지켜주세요
                        </div>
                    </div>
                    <div class="flex_center hover_pointer hover_dark"
                        style="background-color: rgb(68, 87, 255); height: 40px; color: white; margin-bottom: 18px;"
                        @click="send_email_click()">
                        <span v-if="!find_pending">비밀번호 찾기</span>
                        <img v-else src="../assets/images/spinner1.svg" alt="" width="40">
                    </div>
                    <div v-if="login_alert == 1" class="flex_center"
                        style="font-size: 14px; color: rgb(45, 170, 82); margin-bottom: 20px;">
                        <span style="margin-left: 4px;">비밀번호 변경 메일이 발송되었습니다.</span>
                    </div>
                    <div v-else-if="login_alert == 2" class="flex_center"
                        style="font-size: 14px; color: rgb(248, 37, 37); margin-bottom: 20px;">
                        <img src="../assets/images/fail.svg" alt="" width="18"><span style="margin-left: 4px;">가입된 이메일이
                            아닙니다.</span>
                    </div>
                    <div style="text-decoration: underline; text-align: center; margin-bottom: 20px;">
                        <span class="hover_pointer" @click="$emit('go_login')">로그인 페이지</span>
                    </div>
                </div>
                <div style="font-size: 12px;">
                    <div style="margin-bottom: 6px;">
                        <span style="color: rgba(0, 0, 0, 0.637)">서비스가 처음이신가요?</span><span class="hover_pointer"
                            style="text-decoration: underline; margin-left: 10px;" @click="$emit('go_join')">회원가입</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

export default {
    data() {
        return {
            email: '',
            email_possible: 0,
            login_alert: 0,
            find_pending: false,
        }
    },
    watch: {
        email(newValue, oldValue) {
            this.email_possible = 0;
        },
    },
    methods: {
        async send_email_click() {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(this.email)) {
                this.email_possible = 1;
                return;
            }
            if (this.find_pending) return;
            this.find_pending = true;
            const emailInput = this.email;
            const res = await this.$axios.get(import.meta.env.VITE_KOYEB_API + "/text-deliverer-firebase/email-check/" + this.email).then(r => r.data);
            if (res == true) {
                sendPasswordResetEmail(getAuth(), this.email)
                this.login_alert = 1;
            } else {
                this.login_alert = 2;
            }
            this.find_pending = false;
        }
    }
}
</script>

<style scoped>
.input_form {
    width: 100%;
    height: 40px;
    padding: 0 14px;
    font-size: 14px;
    border: solid 1px rgba(0, 0, 0, 0.18);
    border-radius: 5px;
}
</style>
