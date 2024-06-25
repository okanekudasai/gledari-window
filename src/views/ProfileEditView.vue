<template>
    <div class="flex_center" style="height: 100vh">
        <div>
            <div style="text-align: center; margin-bottom: 50px;">
                회원 정보 수정
            </div>
            <div style="margin-bottom: 20px;">
                <hr style="min-width: 300px; border: solid 1px rgb(0, 0, 0, 0.4)">
            </div>

            <div style="display:flex; align-items: center; justify-content: center;">
                <span style="margin-right: 10px; color:rgba(0, 0, 0, 0.767)">프로필 이미지</span>
                <label for="fileInput">
                    <div class="flex_center hover_dark hover_pointer profile_image_container"
                        style="position:relative; width: 40px; height: 40px; border-radius: 100px; overflow: hidden">
                        <img v-if="image_src != undefined && image_src != null" id="image-preview" :src="image_src"
                            style="width: 100%; height: 100%; object-fit: cover;">
                        <img v-else src="../assets/images/plus.svg" alt="">
                    </div>
                </label>
                <input type="file" id="fileInput" ref="imageInput" name="image" accept=".png, .jpg, .jpeg" required
                    style="display:none">
                <div class="flex_center hover_pointer hover_dark"
                    style="background-color: rgb(146, 152, 245); height: 36px; width: 50px; margin-left: 15px; border-radius: 5px; color: white;"
                    @click="confirm_profile_image()">
                    <span>확인</span>
                </div>
            </div>
            <div class="flex_center hover_pointer" style="text-align: center; margin-top: 30px; text-decoration: underline;"
                @click="send_password_email">
                비밀번호 수정
            </div>
            <div v-if="request_password" class="flex_center" style="font-size: 14px; color: rgb(248, 37, 37);">
                <span style="margin-left: 4px;">{{ email }}로 수정 메일이 발송되었습니다.</span>
            </div>
            <div class="hover_pointer"
                style="text-align: center; margin-top: 60px; text-decoration: underline; color: rgba(0, 0, 0, 0.562)"
                @click="$emit('go_welcome')">
                돌아가기
            </div>
        </div>
        <div class="flex_center" style="position: fixed; bottom: -33px; width: 100%; height: 33px; transition: bottom 0.2s"
            ref="copy_alert">
            <div class="flex_center"
                style="background-color: rgba(0, 0, 0, 0.719); color: white; padding: 0 32px; border-radius: 100px; font-size: 13px; height: 100%">
                프로필 이미지가 수정되었습니다!
            </div>
        </div>
    </div>
</template>

<script>
import { getAuth, updateProfile, sendPasswordResetEmail } from "firebase/auth";
import { getStorage, ref, uploadBytes } from "firebase/storage";


export default {
    props: {
        user_info: Object,
    },
    data() {
        return {
            image_src: undefined,
            email: '',
            request_password: false,
        }
    },
    methods: {
        confirm_profile_image() {
            this.$refs.copy_alert.style.bottom = "30px";
            setTimeout(() => {
                this.$refs.copy_alert.style.bottom = "-33px";
            }, 2000);
            this.upload_image(getAuth().currentUser.uid)
        },
        send_password_email() {
            sendPasswordResetEmail(getAuth(), this.email);
            this.request_password = true;
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

            const storage = getStorage();
            const spaceRef = ref(storage, this.user_info.uid + '.jpg');
            const img_ref = 'https://firebasestorage.googleapis.com/v0/b/' + spaceRef.bucket + '/o/' + this.user_info.uid + '?alt=media&token=&t=' + Date.now()
            updateProfile(getAuth().currentUser, {
                photoURL: img_ref
            })
            this.$emit('new_profile_image', img_ref)
        }
    },
    created() {
        this.image_src = getAuth().currentUser.photoURL;
        this.email = getAuth().currentUser.email;
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
.profile_image_container {
    border: solid 1px rgba(0, 0, 0, 0.178);
}

.profile_image_container:hover {
    border: solid 1px rgba(0, 0, 0, 0.726);
}</style>
