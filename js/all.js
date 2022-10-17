//登入註冊相關
const change_a = document.querySelector("form+a");
const submitBTN = document.querySelector(".login button");
const form = document.querySelector("form");
//密碼確認
const PWD = document.querySelector("#PWD");
const PWDAgain = document.querySelector("#PWDAgain");
let sitePath = window.location.pathname;
const inputs = document.querySelectorAll("input");
//登出相關
const logoutBTN = document.querySelector("header button");
//API相關
let domain = "https://todoo.5xcamp.us";
let url = "";
let APIData = {};
let listData = [];
let tabStatus = "all";
//新增資料用
const addBTN = document.querySelector(".inputArea button");
const addInput = document.querySelector(".inputArea input");
//單筆資料更新(切換狀態/編輯修改/刪除)
const listContent = document.querySelector(".listContent .list");

//刪除全部用
const deleteAllBTN = document.querySelector(".listFooter button");
//切換tab(全部/待完成/已完成)用
const tabArea = document.querySelector(".listArea .tab");

//判斷頁面+監聽事件
// 當前頁面為[登入頁](註冊頁同頁做切換)。 .includes()可回傳是否包含該元素的布林值
if (!sitePath.includes("main")){
    // console.log('sitePath_location.pathname',sitePath);
    change_a.addEventListener("click", changeText);
    form.addEventListener("submit", loginRegister);
    PWD.addEventListener("keyup", checkPWD);
    PWDAgain.addEventListener("keyup", checkPWDAgain);
}
// 當前頁面為[todolist內頁](location.pathname為"/main.html")
else if(sitePath.includes("main")) {
    // console.log('sitePath_location.pathname',sitePath);
    //顯示暱稱。使用getItem 把存進去的字串用key名"nickName"取出來。
    const headerNickName = document.querySelector("header h2");
    headerNickName.textContent = `${localStorage.getItem("nickName")}的待辦`;
    //a bunch of event listener...
    logoutBTN.addEventListener("click", logout);
    addBTN.addEventListener("click", addListItem); //事件名稱_click：按鈕被點擊
    addInput.addEventListener("keyup", addListItem); //事件名稱_keyup：輸入框打字
    listContent.addEventListener("click", itemStatus);

    deleteAllBTN.addEventListener("click", deleteAll);
    tabArea.addEventListener("click", changeTab);
    //初次渲染_顯示todolist(get todolist)
    requestData();
}


//登入註冊頁面內容切換
function changeText() {
    const sectionTitle = document.querySelector(".login h2");
    const section = document.querySelector("section");

    switch (change_a.textContent) {
        case "註冊帳號":
            submitBTN.textContent = "註冊帳號"; //與登入button切換
            sectionTitle.textContent = "註冊帳號";
            change_a.textContent = "登入"; //與註冊帳號button切換
            section.classList.add("register"); //顯示註冊帳號欄位
            break;
        case "登入":
            submitBTN.textContent = "登入"; //與註冊帳號button切換
            sectionTitle.textContent = "最實用的線上待辦事項";
            change_a.textContent = "註冊帳號"; //與登入button切換
            section.classList.remove("register");
            break;
    }
    //切換之後清空輸入框&更改必填屬性。getComputedStyle：可讀取當前元素。getPropertyValue：可獲取CSS樣式"指定元素"的屬性值。讀取display屬性值none或是block。
    inputs.forEach((i) => {
        i.value = "";
        let display = window.getComputedStyle(i).getPropertyValue("display");
        //input的required屬性，可自動偵測input是否為空值。當i.required的值為『display:none』，i.required就會為false(不存在)
        i.required = (display === "none") ? false : true;
    });
    //切換之後清空密碼提醒文字
    const notice = document.querySelector("form p.PWD");
    notice.textContent = "";
}

//密碼輸入確認
function checkPWD() {
    // 正規式 至少六個字符，含數字或字母(大小寫)之字串。
    let PWD = /[0-9A-Za-z]{6,}/;
    const notice = document.querySelector("form p.PWD");
    // this(指的是密碼<input>欄位)
    if (this.value === "") {
        notice.textContent = "此欄位必填";
    }
    //欄位已填入資料，且將"match符合時會印出的結果"，使用!將結果反向(即match為null。無符合匹配)。
    //(*將密碼input裡面的value透過match方法查詢，沒有找到匹配返回 null。反之會印出匹配結果。)
    else if (!this.value.match(PWD)) {
        notice.textContent = `格式不符,至少需再填入${6 - this.value.length}字元`;
        // console.log("this.value: ", this.value);
        // console.log("this.value.match(PWD): ", this.value.match(PWD));
    }
    // 如密碼欄位內有值且格式正確，將提示文字清除
    else {
        notice.textContent = "";
        // console.log("this.value.match(PWD): ", this.value.match(PWD));
    }
}
function checkPWDAgain() {
    let PWDText = PWD.value.trim();
    let PWDAgainText = PWDAgain.value.trim();
    const notice = document.querySelector("form p.PWDAgain");
    // if密碼與再次輸入密碼相同 or 再次輸入密碼未輸入字串，則將提醒文字更新為空字串
    if (PWDAgainText === PWDText || PWDAgainText === "") {
        notice.textContent = "";
    } else {
        notice.textContent = "與密碼不相符";
    }
}

//註冊&登入
function loginRegister(e) {
    e.preventDefault();
    const Email = document.querySelector("#ID").value.trim();
    const PWD = document.querySelector("#PWD").value.trim();
    const nickName = document.querySelector("#nickName").value.trim();
    switch (submitBTN.textContent) {
        case "註冊帳號":
            APIData = {
                "user": {
                    "email": Email,
                    "nickname": nickName,
                    "password": PWD
                }
            }
            url = `${domain}/users`;
            break;
        case "登入":
            APIData = {
                "user": {
                    "email": Email,
                    "password": PWD
                }
            }
            url = `${domain}/users/sign_in`;
            break;
    }
    axios.post(url, APIData)
        .then((res) => {
            // console.log(res);
            let token = res.headers.authorization;
            let nickName = res.data.nickname;

            //透過localStorage使用setItem 語法，將資料寫進瀏覽器裡。(把字串存進>指定物件屬性的key"token")
            localStorage.setItem("token", token);
            localStorage.setItem("nickName", nickName);
            Swal.fire({
                icon: 'success',
                title: res.data.message,
                text: `${res.data.nickname}，你好！`
            }).then(() => window.location = "/project_todolist_API/main.html");
            // console.log(token);
        })
        .catch((error) => {
            // console.log(error);
            Swal.fire({
                icon: 'error',
                title: error.response.data.message,
                text: '請檢查是否有拼字錯誤，或註冊新帳號',
            })
        })
}

//登出
function logout() {
    url = `${domain}/users/sign_out`;
    axios.delete(url, {
        //透過localStorage使用getItem將存在瀏覽器的資料取出
        headers: {
            Authorization: localStorage.getItem("token")
        }
    }).then((res) => {
        // console.log(res);
        Swal.fire({
            icon: 'success',
            title: res.data.message,
        }).then(() => {
            //將storage 中的所有屬性移除。
            localStorage.clear();
            window.location = "/project_todolist_API/index.html";
        })

    }).catch((error) => {
        // console.log(error);
        // response.data.error沒有設定資料 為false，所以reason ="" 會等於空字串
        // console.log('data.message ',error.response.data.message);
        // console.log('reason ',reason);
        let reason = error.response.data.error ? error.response.data.error : "";
        Swal.fire({
            icon: 'error',
            title: error.response.data.message,
            text: reason
        })
    });
}

//顯示todolist(get todolist)
function requestData() {
    url = `${domain}/todos`;
    axios.get(url, {
        //將存進瀏覽器的資料取出來，用 getItem 語法 把存進去的字串用key名"token"取出來。
        headers: {
            Authorization: localStorage.getItem("token")
        }
    })
        .then((res) => {
            // console.log(res);
            // console.log("requestData_listData:", res.data.todos);
            listData = res.data.todos;
            render(listData);
        })
        .catch((error) => {
            // console.log("requestData_error:", error);
            // let reason = error.response.data.error ? error.response.data.error : "";
            Swal.fire({
                icon: 'warning',
                title: error.response.data.message,
                text: '轉至登入頁面'
            })  .then(() => window.location = "/project_todolist_API/index.html");
        })
}
// 渲染資料
function render(data) {
    //除了渲染資料以外，也判斷是否要換成插圖
    const emptyArea = document.querySelector(".emptyArea");
    const listArea = document.querySelector(".listArea");
    // console.log(data);
    if (data.length === 0) {
        emptyArea.classList.add("show"); //待辦清單尚未新增資料(length: 0)，顯示"目前尚無待辦事項"
        listArea.classList.remove("show");
    } else {
        emptyArea.classList.remove("show");
        listArea.classList.add("show");

        let tempList = [];
        //判斷tab並篩選要渲染的內容(含tab樣式)，前面已宣告const tabArea = document.querySelector(".listArea .tab");
        //待辦清單狀態 tabArea.childNodes[0]為全部(<li class="active">全部</li>)、tabArea.childNodes[1]為待完成、tabArea.childNodes[2]為已完成。
        tabArea.childNodes.forEach((i) => {
            // 移除原始預設 待辦清單狀態(全部) class="active"
            if (i.nodeName === "LI") {
                i.classList.remove("active");
                // console.log(i);
            };
        })
        switch (tabStatus) {
            case "all":
                tempList = data;
                tabArea.children[0].classList.add("active");
                break;
            case "undo":
                // 根據completed_at，判斷狀態在未完成(null)或已完成(顯示時間)。 
                tempList = data.filter(i => i.completed_at == null);
                // console.log(tempList);
                tabArea.children[1].classList.add("active");
                break;
            case "done":
                tempList = data.filter(i => i.completed_at !== null);
                tabArea.children[2].classList.add("active");
                break;
        }
        const list = document.querySelector(".list");
        let listText = "";
        tempList.forEach((i) => {
            //completed_at初始設定為null(代表"沒勾選",狀態為"待辦")，所以let checked = i.completed_at為不成立(★因為"沒勾選"的情況，不會顯示checked)，因此checked會被設為未選取checked =""(空字串)。反之則設為checked = "checked"。
            // 選取checked = "checked"，未選取checked =""(空字串)
            let checked = i.completed_at ? "checked" : "";
            //宣告listText，組出完整todo的html結構。list.innerHTML再動態覆蓋至.list
            listText += `<li><input type="checkbox" id="${i.id}" ${checked}><label for="${i.id}"><span id="${i.id}_input">${i.content}</span></label><button type="button" class="update">編輯</button><button type="button" class="delete"></button></li>`
        });
        list.innerHTML = listText;
        // console.log('渲染資料render(data)', data);
        countRemain(data);
    }
}
//計算個數
function countRemain(data) {
    let total = 0;
    data.forEach(i => {
        if (!i.completed_at) { total++; }
    })
    const remain = document.querySelector(".listFooter h3");
    remain.textContent = `${total}個 待完成項目`;
}

//新增待辦事項
function addListItem(e) {
    // console.log(e);
    //已透過DOM及綁定監聽事件，判斷按鈕被點擊、輸入框按下enter鍵
    if (e.type === "click" || e.key === "Enter") {
        let inputText = addInput.value.trim();
        if (inputText === "") return;
        url = `${domain}/todos`;
        APIData = {
            "todo": {
                "content": inputText
            }
        };
        // post請求 "傳送資料"給對方，新增todolist清單
        axios.post(url, APIData, {
            headers: {
                Authorization: localStorage.getItem("token")
            }
        })
            .then((res) => {
                // console.log("新增待辦 res.data", res.data);
                // 宣告newData放入整理好的資料，再將新增的資料放在陣列(listData)裡的第一筆
                let newData = {
                    id: res.data.id,
                    content: res.data.content,
                    completed_at: null
                }
                //將新增的資料放在陣列(listData)的第一筆
                listData.unshift(newData);
                // console.log("將新增的資料放在陣列第一筆listData", listData);

                //在渲染的時候顯示全部的內容，再渲染資料，
                //※新增待辦資料，都會是"待完成"狀態，先渲染資料即可。"更改狀態、刪除todo"才需用api get todolist(顯示待辦)     
                tabStatus = "all";
                render(listData);

            })
            .catch((error) => {
                // console.log("addListItem", error.response);
                let reason = error.response.data.error ? error.response.data.error : "";
                alert(error.response.data.message + "　" + reason);
            })
        // 新增完成，刪除輸入框文字
        addInput.value = "";
    }
}

//單筆資料更新(切換狀態/編輯修改/刪除)
function itemStatus(e) {
    // console.log(e.target);
    // 單筆資料更新_刪除單筆
    let index = "";
    // classList.contains 用來檢查是否存在某 class，回傳 boolean 值。
    if (e.target.classList.contains("delete")) {
        url = `${domain}/todos/${e.target.previousSibling.previousSibling.htmlFor}`;
        // console.log('e.target.previousSibling.previousSibling.htmlFor', e.target.previousSibling.previousSibling.htmlFor);
        // console.log('listData', listData);
        index = listData.findIndex(i => i.id === e.target.previousSibling.previousSibling.htmlFor);
        // console.log('index', index);
        listData.splice(index, 1);

        axios.delete(url, {
            headers: {
                Authorization: localStorage.getItem("token")
            }
        })
            .then((res) => {
                // 刪除單筆，不特別跳窗顯示通知使用者
                // console.log("itemStatus_delete", res);
                render(listData);
                // Swal.fire({
                //     icon: 'success',
                //     title: `單筆待辦${res.data.message}`
                // })
            })
            .catch((error) => {
                // console.log("itemStatus_delete", error.response);
                let reason = error.response.data.error ? error.response.data.error : "";
                alert(error.response.data.message + "" + reason)
            })
    }

    // 單筆資料更新_編輯(修改)todo
    if (e.target.classList.contains("update")) {
        // console.log('listData', listData);
        index = listData.findIndex(i => i.id === e.target.previousSibling.htmlFor);
        // console.log('listData[index]', listData[index]);
        // querySelectorAll("span")[index] 取得<span> 索引值「第n個」符合條件的元素
        const updateData = document.querySelectorAll("span")[index];
        // console.log('updateData(("span")[index])', updateData);
        //宣告updateText，組出新增todo的html結構。updateData.innerHTML再動態覆蓋至<span>該索引值
        updateText = `<input name="updateTextOk" class="input_ok" type="input" value="${listData[index].content}"><button type="button" class="update_ok">送出</button>`;
        updateData.innerHTML = updateText;

        //todo編輯鈕(因有多個，需使用索引值來對應) 切換成"隱藏"(進而顯示送出button)
        document.querySelectorAll('.list .update')[index].classList.toggle('button_none');
    }
    //單筆資料更新_編輯(修改)todo > 編輯送出
    if (e.target.classList.contains("update_ok")) {
        // console.log('listData', listData);
        index = listData.findIndex(i => i.id === e.target.parentNode.parentNode.htmlFor);
        // console.log('listData[index]', listData[index]);
        const todoId = listData[index].id;
        // 透過DOM選取到"編輯todo input"，再將值賦予給todo待辦事項
        const todo = document.querySelector(".listContent input[name='updateTextOk']").value.trim();
        // console.log(`todo:${todo} , todoId:${todoId} `);
        
        url = `${domain}/todos/${todoId}`;
        APIData = {
            "todo": {
                "content": todo
            }
        }
        axios.put(url, APIData, {
            headers: {
                Authorization: localStorage.getItem("token")
            }
        })
            .then((res) => {
                // 將新增後的todo，把值更新給listData[index].content(對應todo內容)。
                listData[index].content = todo;
                render(listData);
                // 編輯todo，不特別跳窗顯示通知使用者
                // console.log("updateTodo", res);
            })
            .catch((error) => {
                // console.log("updateTodo", error.response);
                let reason = error.response.data.error ? error.response.data.error : "";
                alert(error.response.data.message + "" + reason)
            });
    }

    //單筆資料更新_切換狀態
    if (e.target.nodeName === "LABEL") {
        url = `${domain}/todos/${e.target.htmlFor}/toggle`;
        // console.log('listData', listData);
        // console.log('e.target.htmlFor', e.target.htmlFor);
        index = listData.findIndex(i => i.id === e.target.htmlFor);
        // console.log('listData[index].completed_at === null的布林值:', listData[index].completed_at === null)
        listData[index].completed_at = (listData[index].completed_at === null) ? "checked_but_not_synced" : null;
        // console.log('listData[index].completed_at的值:', listData[index].completed_at)
        //因patch本身預設要帶data進去，但此api不用帶值，所以必須帶一個空物件。
        axios.patch(url, {}, {
            headers: {
                Authorization: localStorage.getItem("token")
            }
        })
            .then((res) => {
                // 更改狀態，不特別跳窗顯示通知使用者
                // console.log("itemStatus_toggle", res);
                // 將已完成todo勾選時間，更新至listData
                listData[index].completed_at = res.data.completed_at;
                render(listData);
            })
            .catch((error) => {
                // console.log("itemStatus_toggle", error.response);
                let reason = error.response.data.error ? error.response.data.error : "";
                alert(error.response.data.message + "" + reason)
            })
    }
}

//刪除所有已完成
function deleteAll(e){
    // 篩選出狀態"已完成"需要刪除的項目，並且回傳給Todo刪除api(避免資料庫沒成功刪除)
    let needDelete=[];
    needDelete = listData.map(function(item){
        if (item.completed_at !== null){
            // console.log('已完成狀態 item.completed_at',item.completed_at);
            url = `${domain}/todos/${item.id}`
            return axios.delete(url, {
                headers: {
                    Authorization: localStorage.getItem("token")
                }
            })
        }
    })

    // 篩選出需要刪除的項目，執行成功顯示刪除"已完成"項目
    needDelete = listData.filter( i => i.completed_at !== null);
    // console.log('已完成todo_needDelete',needDelete);

    // 篩選出"待完成"項目，再賦予值給listData
    listData = listData.filter(i => i.completed_at===null);
    // console.log('待完成todo_listData',listData);
    //為了在渲染的時候顯示全部的內容
    tabStatus = "all";
    render(listData);

    // Promise.all透過「陣列的形式」傳入多個 promise 函式。多個 Promise 行為同時執行，全部完成後統一回傳。
    Promise.all(needDelete)
    .then((res) => {
        // console.log("deleteAll", res);
        Swal.fire({
            icon: 'success',
            title: '刪除完成',
        })
    })
    .catch((error) => {
        let reason = error.response.data.error ? error.response.data.error : "";
        alert(error.response.data.message + "　" + reason);
        requestData();
    });
    
}

//切換tab
function changeTab(e) {
    switch (e.target.textContent) {
        case "全部":
            tabStatus = "all";
            break;
        case "待完成":
            tabStatus = "undo";
            break;
        case "已完成":
            tabStatus = "done";
            break;
        default:
            return;
    }
    render(listData);
}
