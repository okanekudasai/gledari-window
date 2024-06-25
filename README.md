# 글다리

### 설명
글다리는 기기간의 텍스트와 파일전송을 편리하게 도와주는 크로스플랫폼 프로젝트입니다.

### 제작기간
24.06.21 ~ 24.06.26

### 제작자
okane

### 웹 주소

### 파일 다운로드
<ul>
    <li>windows
    <li>mac
    <li>android
    <li>ios
</ul>

### 로컬 포팅방법
1. .env를 root디렉터리에 만들어 주세요. 이후 다음과 같이 입력해 주세요
```
VITE_FIREBASE_API_KEY=AIz**************************rYiE1E
VITE_FIREBASE_AUTH_DOMAIN=tex************5.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tex************5
VITE_FIREBASE_STOARGE_BUCKET=te***********5.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=82*********8
VITE_FIREBASE_APP_ID=*:824******98:web:e8************13
VITE_FIREBASE_MEASUREMENT_ID=G-*****3L7
VITE_KOYEB_API=https://fe***************p/api
# VITE_KOYEB_API=http://localhost:8080/api
```
firebase 프로젝트 설정 페이지에서 위와 같이 파이어 베이스 초기화용 데이터를 입력해줍니다.
KOYEB_API는 이 후 백엔드 레포지터리의 readme에서 후술합니다.

2. npm 모듈을 설치해 주세요
```
npm i
```

추가. 아이콘이 적용안 될 시 캐시를 지우는 명령어입니다.
```
ie4uinit.exe -show
```
를 사용해서 초기화