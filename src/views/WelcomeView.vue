<template>
    <div>
        <div id="welcome_container" v-bind:style="{ background: config_data.background_color }">
            <div id="chat_container" ref="chat_continer">
                <label for="attach_file_input">
                    <div id="attach_button" class="flex_center hover_pointer hover_dark">
                        <img src="../assets/images/clip.svg" alt="" height=22>
                    </div>
                </label>
                <input id="attach_file_input" type="file" style="display: none;" ref="attachInput">
                <textarea id="chat_textarea" v-if="attach_file == undefined" type="text" v-model="input_lobby_chat"
                    ref="lobby_chat_textarea" :wrap="auto_new_line"></textarea>
                <div v-else style="display: flex; flex-grow: 1; align-items: center; margin-left: 10px; height: 32px;">
                    <div>
                        <span style="font-size: 14px;">{{ this.attach_file.name }}</span>
                        <span style="font-size: 12px;"> ({{ (this.attach_file.size > 1024 * 1024) ?
                            Math.round(this.attach_file.size * 100 / 1024 / 1024) / 100 + "mb" :
                            Math.round(this.attach_file.size * 100 / 1024) / 100 + "kb" }})</span>
                    </div>
                    <div class="flex_center hover_dark hover_pointer"
                        style="background-color: rgb(255, 144, 144); border-radius: 5px; width: 23px; height: 23px; margin-left: 10px;"
                        @click="delete_attach()">
                        <img src="../assets/images/remove.svg" alt="" width="15">
                    </div>
                </div>
                <div id="send_button" class="flex_center hover_pointer hover_dark" @click="send_message()">
                    <div v-if="send_progress == undefined" class="flex_center">
                        <img v-if="!send_pending" src="../assets/images/send-icon.svg" alt="" height=16>
                        <img v-else src="../assets/images/spinner2.svg" alt="" width=25>
                    </div>
                    <div v-else class="flex_center">
                        <span style="font-size: 12px;">{{ Math.round(send_progress) }}%</span>
                    </div>
                </div>
            </div>
            <div v-if="data_pending == false && clipboard.length == 0" style="text-align: center; margin-top: 30px;">
                데이터를 채워 주세요~
            </div>
            <div v-else id="board_container">
                <div class="clipboard_card" v-for="(doc, i) in clipboard" :key="i">
                    <div class="flex_center" :class="{ display_none: !doc.delete_modal }"
                        style="position: absolute; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.336); z-index:1"
                        @click="close_remove_modal(doc)">
                        <div class="real_remove_button flex_center hover_dark hover_pointer"
                            style="background-color: rgb(255, 85, 85); border-radius: 5px; width: 48px; height: 48px; transition: transform 0.2s"
                            @click="real_delete_doc(doc)">
                            <img src="../assets/images/remove.svg" alt="" width="24">
                            <span style="color: white">삭제</span>
                        </div>
                    </div>
                    <div style="padding: 12px;">
                        <div class="time_card">
                            <div class="time_difference">{{ time_difference_displaying(doc.time, doc.diff) }}</div>
                            <div class="time_display">{{ time_displaying(doc.time) }} ({{ doc.local }})</div>
                        </div>
                        <div>
                            <div v-for="(t, j) in doc.text" :key="j">
                                {{ t }}
                            </div>
                            <div style="margin-top: 4px; display:flex;">
                                <div class="hover_pointer hover_dark flex_center" v-if="doc.type == 'file'"
                                    style=" padding: 2px 9px; background: rgb(152, 154, 255); border-radius: 5px; font-size: 14px; color: white; width: 100px; height: 28px;"
                                    @click="download_attach(doc);">
                                    <span v-if="!doc.download_pending" class="flex_center">
                                        <img src="../assets/images/download.svg" alt="" height="20">
                                        <span>다운로드</span>
                                    </span>
                                    <img v-else src="../assets/images/spinner1.svg" alt="" height="28">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex_center hover_dark hover_pointer"
                        style="position:absolute; top: 8px; right: 38px; background-color: rgb(255, 144, 144); border-radius: 5px; width: 24px; height: 24px;"
                        @click="delete_doc(doc)">
                        <img src="../assets/images/remove.svg" alt="" width="15">
                    </div>
                    <div class="flex_center hover_dark hover_pointer"
                        style="position:absolute; top: 8px; right: 8px; background-color: rgb(145, 145, 145); border-radius: 5px; width: 24px; height: 24px;"
                        @click="copy_doc(doc.text)">
                        <img src="../assets/images/copy.svg" alt="" width="15">
                    </div>
                </div>
            </div>
        </div>
        <div v-if="my_menu_modal"
            style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(0, 0, 0, 0.212); padding: 8px 16px; z-index: 10"
            @click="cancel_setting()">
        </div>
        <div :class="(my_menu_modal) ? 'setting_on' : 'setting_off'"
            style="transition: right 0.2s; position: fixed; top: 0; width: 85%; height: 100vh; background-color: white; padding: 25px; z-index:11; border-radius: 15px 0 0 15px; box-shadow: 0 2px 5px 4px rgba(0, 0, 0, 0.212);">
            <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
                <div>
                    <div style="display: flex; align-items: center;">
                        <img src="../assets/images/setting.svg" alt="" width="26"><span
                            style="margin-left: 4px; font-size: 18px;">설정</span>
                    </div>
                    <hr style="margin: 10px 0;">
                    <div style="display: flex; align-items: center; margin-bottom: 10px;">
                        <div>
                            <div>시스템 트레이 활성화</div>
                            <div>
                                <label><input type="radio" name="tray" value="on" v-model="system_tray_on">켜기</label>
                                <label style="margin-left: 10px;"><input type="radio" name="tray" value="off" v-model="system_tray_on">끄기</label>
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; margin-bottom: 10px;">
                        <div>
                            <div>알림 활성화</div>
                            <div>
                                <label><input type="radio" name="note" value="on" v-model="note_on">켜기</label>
                                <label style="margin-left: 10px;"><input type="radio" name="note" value="off" v-model="note_on">끄기</label>
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; margin-bottom: 10px;">
                        <span style="margin-right: 10px;">배경 색 : </span>
                        <input id="back-color" type="color" style="width: 50px; height: 30px; border: none; opacity: 1;"
                            v-model="config_data.background_color">
                    </div>
                    <div style="display: flex; align-items: center; margin-bottom: 10px;">
                        <span style="margin-right: 10px;">스크롤바 색 : </span>
                        <input id="scrollbar-color" type="color"
                            style="width: 50px; height: 30px; border: none; opacity: 1;" v-model="config_data.scrollbar">
                    </div>
                    <div>
                        <span>복사 시 인코딩 : </span>
                        <input type="text"
                            style="border: none; border-bottom: solid 1px rgb(0, 0, 0, 0.5); width: 70px; text-align: center; font-size: 16px; padding: 0 4px;"
                            v-model="config_data.encoding_type">
                    </div>

                    <div style="margin-top: 20px; display: flex; align-items: center;">
                        <div class="hover_pointer hover_dark setting_menu" style="background-color: rgb(132, 175, 255);"
                            @click="save_setting()">적용</div>
                        <div class="hover_pointer hover_dark setting_menu"
                            style="background-color: rgb(163, 163, 163); margin-left: 20px;" @click="cancel_setting()">취소
                        </div>
                    </div>

                    <div v-if="setting_ok == 1" ref="setting_ok">
                        적용되었습니다!
                    </div>
                </div>
                <div style="display:flex; flex-direction: column;">
                    <div style="display:flex; margin-bottom: 10px;">
                        <div class="flex_center hover_pointer hover_underline" @click="profile_edit()">
                            <img src="../assets/images/edit.svg" alt="" width="24"><span>프로필 수정</span>
                        </div>
                    </div>
                    <div style="display:flex;">
                        <div class="flex_center hover_pointer hover_underline" @click="logout_button">
                            <img src="../assets/images/logout.svg" alt="" width="24"><span>로그아웃</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div id="profile_container" style="text-align: end; background-color: rgba(255,255,255,0.8);"
            @click="toggle_my_menu()">
            <img id="profile_image" class="hover_pointer hover_dark"
                :src="user_info.photoURL == null ? default_user_image : user_info.photoURL" alt="">
        </div>
        <div class="flex_center" style="position: fixed; bottom: -33px; width: 100%; height: 33px; transition: bottom 0.2s"
            ref="attach_more_alert">
            <div class="flex_center"
                style="background-color: rgba(0, 0, 0, 0.719); color: white; padding: 0 32px; border-radius: 100px; font-size: 13px; height: 100%">
                150mb를 초과할 수 없어요!
            </div>
        </div>
        <div class="flex_center" style="position: fixed; bottom: -33px; width: 100%; height: 33px; transition: bottom 0.2s"
            ref="copy_alert">
            <div class="flex_center"
                style="background-color: rgba(0, 0, 0, 0.719); color: white; padding: 0 32px; border-radius: 100px; font-size: 13px; height: 100%">
                클립보드에 복사 되었어요!
            </div>
        </div>
        <div class="flex_center" style="position: fixed; bottom: -33px; width: 100%; height: 33px; transition: bottom 0.2s"
            ref="expire_alert">
            <div class="flex_center"
                style="background-color: rgba(0, 0, 0, 0.719); color: white; padding: 0 32px; border-radius: 100px; font-size: 13px; height: 100%">
                다운로드 기간 만료됨!
            </div>
        </div>
    </div>
</template>

<script>
import { getFirestore, collection, query, orderBy, addDoc, updateDoc, onSnapshot, doc, getDoc, deleteDoc, limit } from "firebase/firestore";
import default_user_image from "../assets/images/user.svg"
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, uploadBytesResumable } from "firebase/storage";

export default {
    props: {
        user_info: Object,
        config_data: Object
    },
    data() {
        return {
            init_time: undefined,
            time_now: undefined,
            utc_now: undefined,
            input_lobby_chat: '',
            auto_new_line: 'on',
            clipboard: [],
            my_menu_modal: false,
            default_user_image: default_user_image,
            db_unlink: undefined,
            config_backup: undefined,
            setting_ok: 0,
            data_pending: true,
            attach_file: undefined,
            attach_alert: false,
            expire_alert: false,
            send_pending: false,
            send_progress: undefined,
            system_tray_on: undefined,
            note_on: undefined,
        }
    },
    watch: {
        input_lobby_chat(newValue, oldValue) {
            this.setTextAreaHeight();
        },
        system_tray_on(newValue, oldValue) {
            this.config_data.tray_icon = this.system_tray_on;
        },
        note_on(newValue, oldValue) {
            this.config_data.note = this.note_on;
        },
    },
    methods: {
        setTextAreaHeight() {
            this.$refs.lobby_chat_textarea.style.height = 'auto'
            this.$refs.lobby_chat_textarea.style.height = (this.$refs.lobby_chat_textarea.scrollHeight + 1) + "px"
        },
        async send_message() {
            if (this.send_pending == true) return;
            if (this.input_lobby_chat.length == 0 && this.attach_file == undefined) return;
            this.send_pending = true;
            let time_to_use = await this.$axios.get("http://worldtimeapi.org/api/ip").then(res => {
                this.time_now = new Date(res.data.datetime.split(".")[0]);
                return res.data;
            }).catch(() => {location.reload();})
            let raw_localTime = time_to_use;
            let local = raw_localTime.timezone.split("/")[1];
            let utc_time = raw_localTime.utc_datetime;
            let tt = raw_localTime.datetime.split("T");
            let raw_date = tt[0];
            let raw_time_ms = tt[1].split("+")[0].split(".");
            let raw_time = raw_time_ms[0];
            let ms = raw_time_ms[1];
            let time = raw_date + " " + raw_time + " " + ms;
            if (this.attach_file != undefined) {
                const docRef = doc(getFirestore(), "storage", "current");
                const docSnap = await getDoc(docRef);

                // 파이어 스토어에서 남은 용량 검사
                const nokori = docSnap.data().use;
                if (nokori + this.attach_file.size > 4.5 * 1024 * 1024 * 1024) {
                    // if (nokori + this.attach_file.size > 10) {
                    this.send_pending = false;
                } else {
                    const storage = getStorage();
                    const storageRef = ref(storage, this.user_info.uid + "-" + time + "-" + this.attach_file.name);
                    // uploadBytes(storageRef, this.attach_file).then((snapshot) => {
                    //     updateDoc(docRef, {
                    //         use: nokori + this.attach_file.size
                    //     });
                    //     this.sending(this.attach_file.name, time, local, utc_time, 'file');
                    //     this.attach_file = undefined;
                    //     this.send_pending = false;
                    // })

                    const uploadTask = uploadBytesResumable(storageRef, this.attach_file);

                    uploadTask.on('state_changed',
                        (snapshot) => {
                            // Observe state change events such as progress, pause, and resume
                            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            this.send_progress = progress;
                        },
                        (error) => {
                            // Handle unsuccessful uploads
                        }, 
                        () => {
                            updateDoc(docRef, {
                                use: nokori + this.attach_file.size
                            });
                            this.sending(this.attach_file.name, time, local, utc_time, 'file');
                            this.attach_file = undefined;
                            this.send_pending = false;
                            this.send_progress = undefined;
                        }
                    );
                }

            } else {
                let text_buffer = this.input_lobby_chat;
                this.input_lobby_chat = '';
                setTimeout(() => {
                    this.setTextAreaHeight();
                }, 5);
                await this.sending(text_buffer, time, local, utc_time, 'text');
                this.send_pending = false;
            }
        },
        async sending(text_buffer, time, local, utc_time, type) {

            await addDoc(collection(getFirestore(), this.user_info.uid), {
                text: text_buffer,
                time: time,
                local: local,
                utc: utc_time,
                type: type,
            });

        },
        async load_firestore() {
            const myRef = collection(getFirestore(), this.user_info.uid);
            const q = query(myRef, orderBy("utc", "asc"));
            this.db_unlink = onSnapshot(q, (querySnapshot) => {
                querySnapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        let doc = change.doc;
                        let res = doc.data();
                        let text = res.text;
                        let raw_date = res.time.split(" ");
                        let date = raw_date[0].split("-");
                        let time = raw_date[1].split(":");
                        let save_time = new Date(date[0], date[1] - 1, date[2], time[0], time[1], time[2]);
                        if (this.config_data.note == 'on' && res.utc > this.utc_now) {
                            window.electronAPI.note_on({message: text, sound: false});
                        }
                        this.clipboard.unshift({ text: text.split(/\n/g), time: save_time, diff: Math.max(0, this.get_time_difference(save_time)), local: res.local, id: doc.id, delete_modal: false, type: res.type, name_time: res.time, download_pending: false });
                    }
                    if (change.type === "removed") {
                        let doc = change.doc;
                        const index = this.clipboard.findIndex(d => d.id === doc.id);
                        if (index !== -1) {
                            this.clipboard.splice(index, 1);
                        }
                    }
                });
                this.data_pending = false;
            });
        },
        async set_timer() {
            let timer = 0;
            setInterval(() => {
                timer++;
                if (timer == 60 * 10) {
                    timer = 0;
                    this.$axios.get("http://worldtimeapi.org/api/ip").then(res => {
                        this.time_now = new Date(res.data.datetime.split(".")[0]);
                    })
                }
                else this.time_now = new Date(this.time_now.getTime() + 1000);
                for (let c of this.clipboard) {
                    c.diff = this.get_time_difference(c.time);
                }
            }, 1000)
        },
        time_displaying(date) {
            let md = this.get_month_difference(date);
            let year = date.getFullYear();
            let month = date.getMonth() + 1;
            let day = date.getDate();
            let hours = ('0' + date.getHours()).slice(-2);
            let minutes = ('0' + date.getMinutes()).slice(-2);
            let seconds = ('0' + date.getSeconds()).slice(-2);

            let formattedDate = ((md >= 12) ? `${year}년 ${month}월 ${day}일` : `${month}월 ${day}일 ${hours}:${minutes}:${seconds}`);
            return formattedDate;
        },
        get_time_difference(date) {
            let diff = (this.time_now.getTime() - date.getTime()) / 1000;
            return diff;
        },
        time_difference_displaying(time, diff) {
            let md = this.get_month_difference(time);
            if (md > 0) {
                if (md >= 12) return Math.trunc(md / 12) + "년 전";
                else return md + "달 전"
            }
            if (diff >= 60 * 60 * 24) return Math.trunc(diff / (60 * 60 * 24)) + "일 전";
            if (diff >= 60 * 60) return Math.trunc(diff / (60 * 60)) + "시간 전";
            if (diff >= 60) return Math.trunc(diff / 60) + "분 전";
            return diff % 60 + "초 전"
        },
        get_month_difference(time) {
            let d1 = this.time_now;
            let d2 = time;

            // 각 날짜의 연도, 월, 일을 가져옵니다.
            let year1 = d1.getFullYear();
            let year2 = d2.getFullYear();
            let month1 = d1.getMonth();
            let month2 = d2.getMonth();
            let day1 = d1.getDate();
            let day2 = d2.getDate();

            let monthDiff = (year1 * 12 + month1) - (year2 * 12 + month2)
            if (day1 - day2 < 0) monthDiff--;
            return monthDiff
        },
        delete_doc(e) {
            e.delete_modal = true;
        },
        copy_doc(text) {
            try {
                let raw_text = text.join("\n")
                const encoder = new TextEncoder();
                const encoded = encoder.encode(raw_text);
                const decoder = new TextDecoder(this.config_data.encoding_type);
                const decoded = decoder.decode(encoded);
                navigator.clipboard.writeText(decoded);
                this.$refs.copy_alert.style.bottom = "30px";
                setTimeout(() => {
                    this.$refs.copy_alert.style.bottom = "-33px";
                }, 2000);
            } catch (error) {
                console.log("복사 실패")
            }
        },
        close_remove_modal(e) {
            e.delete_modal = false;
        },
        real_delete_doc(d) {
            deleteDoc(doc(getFirestore(), this.user_info.uid, d.id));
            if (d.type == 'file') {
                const storage = getStorage();
                const desertRef = ref(storage, `${this.user_info.uid}-${d.name_time}-${d.text[0]}`);
                deleteObject(desertRef)
            }
        },
        async logout_button(e) {
            e.stopPropagation();
            await this.db_unlink()
            this.$emit("user_logout")
        },
        toggle_my_menu() {
            this.my_menu_modal = !this.my_menu_modal;
            if (this.my_menu_modal) {
                Object.keys(this.config_data).forEach(key => {
                    this.config_backup[key] = this.config_data[key];
                });
            } else {
                this.system_tray_on = this.config_data.tray_icon;
                this.note_on = this.config_data.note;
            }
        },
        save_setting() {
            if (this.config_backup.tray_icon == 'on' && this.config_data.tray_icon == 'off') {
                window.electronAPI.toggleTray('off');
            } else if (this.config_backup.tray_icon == 'off' && this.config_data.tray_icon == 'on') {
                window.electronAPI.toggleTray('on');
            }
            window.electronAPI.setConfig(this.config_data).then(() => {
                Object.keys(this.config_data).forEach(key => {
                    this.config_backup[key] = this.config_data[key];
                });
            });
            this.setting_ok = 1;
            setTimeout(() => {
                this.setting_ok = 0;
            }, 2000);
        },
        cancel_setting() {
            Object.keys(this.config_data).forEach(key => {
                this.config_data[key] = this.config_backup[key];
            });
            this.toggle_my_menu();
        },
        profile_edit() {
            this.$emit('go_profile_edit');
        },
        delete_attach() {
            this.attach_file = undefined;
        },
        download_attach(doc) {
            doc.download_pending = true;
            const storage = getStorage();
            const pathReference = ref(storage, `${this.user_info.uid}-${doc.name_time}-${doc.text[0]}`);
            getDownloadURL(pathReference)
                .then((url) => {
                    // `url` is the download URL for 'images/stars.jpg'

                    // This can be downloaded directly:
                    const xhr = new XMLHttpRequest();
                    xhr.responseType = 'blob';
                    xhr.onload = (event) => {
                        const blob = xhr.response;

                        const link = document.createElement('a');
                        link.href = window.URL.createObjectURL(blob);
                        link.download = '(download)' + doc.text[0].split(".")[0];
                        link.click();
                        window.URL.revokeObjectURL(link.href)
                    };
                    xhr.open('GET', url);
                    xhr.send();
                })
                .catch((error) => {
                    this.$refs.expire_alert.style.bottom = '30px';
                    setTimeout(() => {
                        this.$refs.expire_alert.style.bottom = '-33px';
                    }, 2500)
                    // Handle any errors
                })
                .finally(() => {
                    doc.download_pending = false;
                });
        }
    },
    mounted() {
        this.setTextAreaHeight();
        this.$refs.attachInput.addEventListener('change', (f) => {
            const file = f.target.files[0];
            if (file.size > 150 * 1024 * 1024) {
                this.$refs.attach_more_alert.style.bottom = '30px';
                setTimeout(() => {
                    this.$refs.attach_more_alert.style.bottom = '-33px';
                }, 2500);
            }
            else this.attach_file = file;
        });
        this.$refs.chat_continer.addEventListener('drop', (e) => {
            e.preventDefault();
            this.attach_file = e.dataTransfer.files;
            if (this.attach_file.length > 0) {
                this.attach_file = this.attach_file[0];
            }
        });
    },
    async created() {
        await this.$axios.get("http://worldtimeapi.org/api/ip").then(res => {
            this.time_now = new Date(res.data.datetime.split(".")[0]);
            this.utc_now = res.data.utc_datetime;
        }).catch(() => {
            location.reload();
        });
        this.set_timer();
        this.load_firestore();
        this.config_backup = {};
        this.system_tray_on = this.config_data.tray_icon;
        this.note_on = this.config_data.note;
        Object.keys(this.config_data).forEach(key => {
            this.config_backup[key] = this.config_data[key];
        });
    }
}
</script>

<style scoped>
#profile_container {
    position: fixed;
    bottom: 10px;
    right: 10px;
    z-index: 100000;
    border-radius: 100px;
    overflow: hidden;
    width: 36px;
    height: 36px;
}

#profile_image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    box-shadow: 0px 2px 8px 2px rgb(0, 0, 0, 0.1);
}

#welcome_container {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

#chat_container {
    /* width: calc(100% - 20px - 32px - 20px); */
    margin: 45px 20px 0 20px;
    display: flex;
    justify-content: space-between;
    border: 1px solid rgb(0, 0, 0, 0.2);
    padding: 4px 6px 4px 4px;
    background-color: white;
}

#attach_button {
    background: rgb(235, 235, 235);
    height: 28px;
    width: 32px;
    margin-top: 2px;
}

#chat_textarea {
    margin-left: 5px;
    min-height: 32px;
    max-height: calc(100vh * 0.5);
    resize: none;
    flex-grow: 1;
    border: none;
    white-space: pre-line;
}

#chat_textarea::-webkit-scrollbar {
    width: 3px;
    /* 세로축 스크롤바 폭 너비 */
    height: 3px;
}

#chat_textarea::-webkit-scrollbar-thumb {
    background: v-bind(config_data.scrollbar);
    /* 스크롤바 막대 색상 */
    border-radius: 12px 12px 12px 12px;
}

#send_button {
    background: rgb(228, 228, 40);
    height: 28px;
    width: 32px;
    margin-left: 8px;
    margin-top: 2px;
}

#board_container {
    flex-grow: 1;
    overflow: overlay;
    scrollbar-gutter: stable;
    padding: 5px 20px 10px;
    margin-bottom: 20px;
    margin-top: 10px;
}

#board_container::-webkit-scrollbar {
    width: 3px;
    /* 세로축 스크롤바 폭 너비 */
    height: 3px;
}

#board_container::-webkit-scrollbar-thumb {
    background: v-bind(config_data.scrollbar);
    /* 스크롤바 막대 색상 */
    border-radius: 12px 12px 12px 12px;
}

#board_container>.clipboard_card:not(:first-child) {
    margin-top: 20px;
}

.clipboard_card {
    box-shadow: 0 3px 8px 1px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    background-color: white;
    position: relative;
    overflow: hidden
}

.time_card {
    display: flex;
    align-items: baseline;
    margin-bottom: 5px;
}

.time_difference {
    margin-right: 10px;
    background-color: rgb(120, 120, 240);
    color: white;
    font-size: 0.8em;
    padding: 3px 12px;
    border-radius: 100px;
}

.time_display {
    font-size: 0.8em;
}

.real_remove_button {
    box-shadow: 0 2px 8px 1px rgba(0, 0, 0, 0.2);
}

.real_remove_button:hover {
    transform: scale(1.05);
}


.real_remove_button>span {
    display: none;
}

.real_remove_button:hover>span {
    display: inline-block;
}

.real_remove_button:hover>img {
    display: none;
}

.setting_menu {
    padding: 8px 16px;
    border-radius: 10px;
    background-color: rgb(132, 175, 255);
    color: white;
    box-shadow: 0 2px 4px 1px rgb(0, 0, 0, 0.1);
}

.setting_on {
    right: 0;
}

.setting_off {
    right: -86%;
}
</style>
