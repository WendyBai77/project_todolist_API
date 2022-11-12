Todo List Practice
===
### Project 說明
### 使用`JavaScipt`實作`Todo List`練習，透過原生 JavaScipt 操作 `DOM API`，並`串接Todo List API`將資料傳送至資料庫，設計登入/登出/註冊/新增/修改/刪除、切換狀態功能。
---

### Demo

![](https://github.com/WendyBai77/project_todolist_API/blob/main/Demo.gif)

---
### 使用說明
1. **登入**信箱、密碼後可進入Todo List主頁，**初次登入**需先進行帳號**註冊**。
2. 登入**顯示使用者暱稱**，輸入待辦事項後，點選+符號來**新增**代辦事項。
3. 可針對待辦事項內容做**修改**及**刪除**，並勾選待辦事項來**切換"待完成/已完成"狀態**。
4. 針對已完成的待辦事項，可點選"清除已完成項目"進行**全部刪除**。
5. 使用完畢可進行**登出**。下一次登入依然會保存先前資料。
#### ※ 注意：Todo List API 每天(24h)會進行清除! 
---
### 學習紀錄
- 串接Todo List API，設計登入/登出/註冊/新增/修改/刪除、切換狀態功能。
- 使用「正規式」（Regular expressions）進行註冊、登入時的字串比對。
- 使用localStorage，將網頁中的資料儲存在使用者的瀏覽器中。
- Promise.all透過「陣列的形式」傳入多個 promise 函式。多個 Promise 行為同時執行，全部完成後統一回傳。
- location.pathname 返回當前頁面的路徑和文件名
- 使用響應式網頁設計，並導入SASS/SCSS
- 三元運算子
