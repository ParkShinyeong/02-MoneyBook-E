# 2주차-MoneyBook-project 💫

### :sunny: ​프로젝트 개요

---

가계부 API 서버를 구현합니다. 사용자는 인증을 거쳐 가계부에 접근할 수 있고, 가계부 내역을 관리합니다.

### :bookmark: 목차

---

- [2주차-MoneyBook-project 💫](#2주차-moneybook-project-)
    - [:sunny: ​프로젝트 개요](#sunny-프로젝트-개요)
    - [:bookmark: 목차](#bookmark-목차)
    - [:question: 요구사항 분석](#question-요구사항-분석)
      - [:lock: 인증](#lock-인증)
      - [:blue_book: 가계부](#blue_book-가계부)
      - [:file_folder: ETC](#file_folder-etc)
    - [:family: 팀원](#family-팀원)
    - [:full_moon: ​프로젝트 실행 및 테스트](#full_moon-프로젝트-실행-및-테스트)
    - [:key: 핵심 기능](#key-핵심-기능)
    - [:cd: 기술 스택](#cd-기술-스택)

### :question: 요구사항 분석

---

#### :lock: 인증

- 회원가입과, 로그인, 로그아웃 API를 개발합니다.
- 로그인하지 않은 사용자는 가계부 내역에 접근할 수 없습니다.
- JWT로 Access Token과 Refresh Token을 관리합니다.

#### :blue_book: 가계부


- Create : 사용한 돈의 금액과 관련 메모를 남깁니다.
- Update : 사용한 금액과 관련 메모 수정합니다.
- Delete : 원하는 내역 삭제합니다. (soft-delete)
- Restore : 삭제한 내역을 복구할 수 있습니다.
- Read (list) : 사용자의 가계부 목록을 조회합니다.
- Read (detail) : 사용자의 가계부 상세목록을 가져옵니다.

#### :file_folder: ETC

- [ERD](https://user-images.githubusercontent.com/57704568/178136467-1758f4ca-e7ea-4532-83b4-ed92a075ea10.png)
- Docker와 GCP를 사용한 배포 : [http://34.64.239.67:3000/](http://34.64.239.67:3000/)
- Unit Test 작성
- Lint, Prettier 포맷팅
- Commit Convention
  [Ref. Commit Convention](https://github.com/pre-onboarding-backend-E/02-MoneyBook-E/wiki/Commit-Convention)

### :family: 팀원

---

| 이름   | Github        | email               | blog                                                                                 |
| ------ | ------------- | ------------------- | ------------------------------------------------------------------------------------ |
| 염하늘 | everchloe97   | star57009@khu.ac.kr | [everchloe97 (YEOM HA NEUL) - velog](https://velog.io/@everchloe97)                  |
| 김용민 | ymink716      | ymink716@gmail.com  | https://velog.io/@calm0_0                                                            |
| 김태영 | leokim1178    | leo950906@gmail.com | [0tae’s devlog](https://story0tae.tistory.com/)                                      |
| 박신영 | ParkShinyeong | syngh503@gmail.com  | [신영의 노션](https://sudsy-action-667.notion.site/5ed77b24085f42b8bd1c9e5c0b37d25d) |

:cloud: **ENV**

---

```
DB_HOST=database-server
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=2222
DB_DATABASE=money-book
JWT_SECRET_KEY= ??
JWT_EXPIRATION_TIME= ?? (ex / 1h 형식으로 작성합니다.)
JWT_REFRESH_TOKEN_SECRET= ??
JWT_REFRESH_TOKEN_EXPIRATION_TIME= ?? (ex / 1h 형식으로 작성합니다.)
```

- /env/.env 에 다음과 같이 환경 변수를 설정합니다.

### :full_moon: ​프로젝트 실행 및 테스트

---

1. 실행 💡

```
cd 02-MoneyBook-E/
docker compose build
docker compose up
```

2. 테스트 💡

```
yarn test
```

3. Swagger API 💡

```
1. swagger (api 문서)
  - localhost:3000/api/docs 접속 - local
  - 배포 ip /접속 - 배포
2. sign up을 통해 user를 생성하고 login 후 api를 테스트 할 수 있습니다.
```

### :key: 핵심 기능

---

- **User (사용자)** 🙍‍♀️🙍‍♂️
  - 회원가입
  - 로그인
  - 로그아웃
  - 토큰 재발급
- **Money book (가계부)** 💰📝
  - 가계부 작성
  - 가계부 수정
  - 가계부 목록 조회
  - 가계부 상세 조회
  - 가계부 삭제
  - 삭제된 가계부 내역 복구

### :cd: 기술 스택

---

<img src="https://img.shields.io/badge/Typescript-3178C6?style=flat&logo=typescript&logoColor=white"/>
<img src="https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white"/>
<img src="https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white"/>
<img src="https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=mysql&logoColor=white"/>
<img src="https://img.shields.io/badge/NodeJS-339933?style=flat&logo=nodejs&logoColor=white"/>
<img src="https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white"/>

