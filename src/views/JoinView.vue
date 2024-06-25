<template>
    <div class="flex_center" style="height: 100vh">
        <div>
            <div style="text-align: center; margin-bottom: 50px;">
                회원 가입
            </div>
            <div style="margin-bottom: 20px;">
                <div style="text-align: end; font-size: 14px; color: rgb(0,0,0,0.7)">
                    *필수 정보입니다
                </div>
                <hr style="min-width: 300px; border: solid 1px rgb(0, 0, 0, 0.4)">
            </div>
            <div
                style="display: grid; grid-template-columns: 1fr 60px; row-gap: 10px; column-gap: 15px; margin-bottom: 20px;">
                <div>
                    <input type="email" v-model="email" placeholder="*이메일">
                    <div v-if="email_possible > 0">
                        <div v-if="email_possible == 2" class="input_alert" style="color: rgb(233, 47, 47)">
                            사용 중인 이메일입니다.
                        </div>
                        <div v-else-if="email_possible == 1" class="input_alert" style="color: rgb(11, 151, 18)">
                            사용 가능한 이메일입니다.
                        </div>
                        <div v-else-if="email_possible == 3" class="input_alert" style="color: rgb(233, 47, 47)">
                            이메일 형식을 지켜주세요
                        </div>
                        <div v-else-if="email_possible == 5" class="input_alert" style="color: rgb(233, 47, 47)">
                            이메일 중복을 확인해 주세요
                        </div>
                    </div>
                </div>
                <div class="flex_center hover_pointer hover_dark"
                    style="margin-left: 10px; background-color: rgb(146, 152, 245); height: 36px; width: 100%; margin: 2px auto 0; border-radius: 5px; color: white;"
                    @click="email_confirm()">
                    <span v-if="email_possible != 4">확인</span>
                    <img v-else src="../assets/images/spinner1.svg" alt="" width="40">
                </div>
                <div>
                    <input type="password" v-model="password" placeholder="*비밀번호">
                    <div v-if="password">
                        <div v-if="password.length < 6" class="input_alert" style="color: rgb(233, 47, 47)">
                            최소 6자이상이 필요합니다
                        </div>
                        <div v-else class="input_alert" style="color: rgb(11, 151, 18)">
                            사용해도 좋은 비밀번호입니다
                        </div>
                    </div>
                </div>
                <div></div>
                <div>
                    <input type="password" v-model="password_confirm" placeholder="*비밀번호 확인">
                    <div v-if="password && password_confirm">
                        <div v-if="password != password_confirm" class="input_alert" style="color: rgb(233, 47, 47)">
                            비밀번호가 일치하지 않습니다
                        </div>
                        <div v-else class="input_alert" style="color: rgb(11, 151, 18)">
                            비밀번호가 일치합니다
                        </div>
                    </div>
                </div>
                <div></div>
                <div style="display:flex; align-items: center; grid-column: 1 / -1;">
                    <span style="margin-right: 10px; color:rgba(0, 0, 0, 0.767)">프로필 이미지</span>
                    <label for="fileInput">
                        <div class="flex_center hover_dark hover_pointer profile_image_container" style="position:relative; width: 40px; height: 40px; border-radius: 100px; overflow: hidden">
                            <img v-if="image_src != undefined" id="image-preview" :src="image_src"
                                style="width: 100%; height: 100%; object-fit: cover;">
                            <img v-else src="../assets/images/plus.svg" alt="">
                        </div>
                    </label>
                    <input type="file" id="fileInput" ref="imageInput" name="image" accept=".png, .jpg, .jpeg" required
                        style="display:none">
                </div>
            </div>
            <!-- <div id="join_button" class="flex_center hover_pointer hover_dark" @click="join_button" :class="{button_possible : password != '' && password == password_confirm && email_possible == 1}"> -->
            <div id="join_button" class="flex_center" @click="join_button()"
                :class="(password.length >= 6 && password == password_confirm && email_possible == 1) ? 'button_possible' : 'button_impossible'">
                회원가입
            </div>
            <div style="text-decoration: underline; text-align: center; margin-bottom: 20px;">
                <span class="hover_pointer" @click="$emit('go_login')">로그인 페이지</span>
            </div>
            <div style="font-size: 10px;">
                *이메일은 존재하지 않는 것을 사용해도 무관하나<br>
                비밀번호 복구를 위해 사용하는 이메일을 쓰는 것을 권장합니다.
            </div>
        </div>
    </div>
</template>

<script>
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getStorage, ref, uploadBytes } from "firebase/storage";

export default {
    props: {
        user_info: Object,
    },
    data() {
        return {
            email: '',
            email_possible: 0, // 0대기 1됨 2안됨 3형식x 4펜딩 5잘못된 시도
            password: '',
            password_confirm: '',
            image_src: undefined,
        }
    },
    watch: {
        email(newValue, oldValue) {
            this.email_possible = 0;
        },
    },
    methods: {
        async email_confirm() {
            if (this.email_possible == 4) return;
            this.email_possible = 4;
            const emailInput = this.email;
            if (this.isValidEmail(emailInput)) {
                const res = await this.$axios.get(import.meta.env.VITE_KOYEB_API + "/text-deliverer-firebase/email-check/" + this.email).then(r => r.data);
                if (res == true) {
                    this.email_possible = 2;
                } else {
                    this.email_possible = 1;
                }
            } else {
                this.email_possible = 3;
            }
        },
        join_button() {
            if (!(this.password.length >= 6 && this.password == this.password_confirm && this.email_possible == 1)) {
                if (this.email_possible != 1) this.email_possible = 5;
                return;
            }
            // this.$emit('join_process', { email: this.email, password: this.password });
            const auth = getAuth()
            createUserWithEmailAndPassword(auth, this.email, this.password)
                .then(async (userCredential) => {
                    if (this.image_src == undefined) return;
                    const user = userCredential.user;
                    this.upload_image(user.uid);
                    const storage = getStorage();
                    const spaceRef = ref(storage, user.uid + '.jpg');
                    await updateProfile(auth.currentUser, {
                        photoURL: 'https://firebasestorage.googleapis.com/v0/b/' + spaceRef.bucket + '/o/' + user.uid + '?alt=media&token='
                    })
                    location.reload();
                })
                .catch((error) => {
                    console.log(error);
                })
        },
        isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },
        upload_image(uid) {
            const img = new Image();
            img.src = this.image_src;
            img.onload = () => {
                this.compressImage(img, uid);
            }
        },
        compressImage(img, uid) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const maxWidth = 80; // Maximum width for the compressed image
            const maxHeight = 80; // Maximum height for the compressed image

            let width = img.width;
            let height = img.height;

            // Calculate new dimensions while maintaining aspect ratio
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height *= maxWidth / width));
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width *= maxHeight / height));
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            // Convert the canvas to a Blob and display the compressed image
            canvas.toBlob((blob) => {
                const storage = getStorage();
                const storageRef = ref(storage, uid);

                // 'file' comes from the Blob or File API
                uploadBytes(storageRef, blob)
            }, 'image/jpeg', 0.7);
        }
    },
    mounted() {
        this.$refs.imageInput.addEventListener('change', (f) => {
            const file = f.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.image_src = e.target.result;
                }
                reader.readAsDataURL(file);
            }
        });
    }
}
</script>

<style scoped>
input {
    display: block;
    height: 40px;
    width: 100%;
    padding: 0 14px;
    font-size: 14px;
    border: solid 1px rgba(0, 0, 0, 0.18);
    border-radius: 5px;
}

.input_alert {
    font-size: 11px;
}

#join_button {
    height: 40px;
    color: white;
    margin-bottom: 18px;
}

.button_impossible {
    background-color: rgb(139, 139, 139);
}

.button_impossible:hover {
    cursor: default;
}

.button_possible {
    background-color: rgb(68, 87, 255);
}

.button_possible:hover {
    filter: brightness(90%);
    cursor: pointer;
}
.profile_image_container {
    border: solid 1px rgba(0, 0, 0, 0.178);
}
.profile_image_container:hover {
    border: solid 1px rgba(0, 0, 0, 0.726);
}
</style>
