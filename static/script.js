let currentUrl = '/rasp?groupId=531030143';
let week;
let today = new Date().getDay();
let styles = "";
let styleSheet = document.createElement("style");
styleSheet.classList.add("schedule-style");

function updateSchedule(url) {
    currentUrl = url;
    fetch(url)
        .then((data) => data.json())
        .then((res) => {
            renderSchedule(res);
            week = parseInt(res.currentWeek);
            document.querySelector("#prevButton").style.visibility = (week == 1)? "hidden": "visible";
            document.querySelector("#prevButton").innerHTML = `< ${week - 1} неделя`;
            document.querySelector("#nextButton").innerHTML = `${week + 1} неделя >`;
            document.querySelector("#week").innerHTML = `${week} неделя`;  
        });
}

function createLink(correctElem){
    let elem;
    if (correctElem.link !== null) {
        elem = document.createElement("a");
        elem.href = "#";
        elem.addEventListener('click', () => updateSchedule(correctElem.link));
    } 
    else elem = document.createElement("div");
    elem.innerHTML = correctElem.name;
    return elem;
}

function renderSchedule(data) {
    let table = document.querySelector("#schedule");
    table.innerHTML = "";
    let headers = table.insertRow();
    headers.classList.add("first-row");
    headers.insertCell().appendChild(document.createTextNode("Время"));

    for (let date of data.dates) {
        let cell = headers.insertCell();
        cell.appendChild(document.createTextNode(date));
    }
 
    let days = data.daysOfSchedule;
    for (let time of data.times) {

        let ind = 0;
        let row = table.insertRow();
        row.classList.add("one-row");
        row.insertCell().appendChild(document.createTextNode(time));

        for (let day of days) {
            if (ind > 5) break;
            
            let infoToInsert = document.createElement("div");
            if (day.subject !== null) {
                
                infoToInsert.innerHTML = `<b>${day.subject}</b><br>${day.place}<br>`;
                infoToInsert.classList.add("text-style1");
                infoToInsert.appendChild(createLink(JSON.parse(day.teacher)));
                infoToInsert.appendChild(document.createElement("br"));
                
                for (let group of day.groups) {
                    infoToInsert.appendChild(createLink(JSON.parse(group)));
                    infoToInsert.appendChild(document.createElement("br"));
                }
            } 
            let cell = row.insertCell();
            cell.classList.add(`column`);
            cell.appendChild(infoToInsert);
            cell.classList.add("one-cell");
            ind++;
        }
        days = days.slice(ind);
    }
}

function changePage(nextPage) {
    currentUrl += `&selectedWeek=${nextPage ? week + 1 : week - 1}`;
    updateSchedule(currentUrl);
}

function changeDayOnMobile(nextDay = undefined) {
	if (today === 6) today = 5;
    
    if (typeof nextDay !== "undefined") {
        document.head.removeChild(styleSheet);
        if (nextDay) {
            today === 5 ? today = 0 : today++;
        } else {
            today === 0 ? today = 5 : today--;
        }
    }
    styles = "";
    for (let i = 0; i < 7; i++) 
        if (i !== today) styles += `.column-${i} { display: none; }`;

    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}

window.addEventListener("resize", () => {
    if (window.innerWidth < 481) {
        changeDayOnMobile();
        let btn = document.querySelector("#nextDay");
        btn.style.display = "block";
        btn = document.querySelector("#prevDay");
        btn.style.display = "block";
    } else {
        if (document.querySelector(".schedule-style")) {
            let btn = document.querySelector("#nextDay");
            btn.style.display = "none";
            btn = document.querySelector("#prevDay");
            btn.style.display = "none";
            document.head.removeChild(styleSheet);
        }
    }
})

updateSchedule(currentUrl);

setTimeout(() => {
    fetch('/getGroups')
        .then((data) => data.json())
        .then((res) => {
            let selectElement = document.querySelector("#select");
            for (let group of res.groups) {
                let element = document.createElement("option");
                element.innerHTML = group.name;
                element.setAttribute("value", group.link);
                selectElement.appendChild(element);
            }
            selectElement.addEventListener("change", () => {
                updateSchedule(selectElement.value);
            })
        })
}, 1000);

setTimeout(() => {
    fetch('/getTeachers')
        .then((data) => data.json())
        .then((res) => {
            let selectElement = document.querySelector("#selectTeacher");
            for (let teacher of res.teachers) {
                let element = document.createElement("option");
                element.innerHTML = teacher.name;
                element.setAttribute("value", teacher.link);
                selectElement.appendChild(element);
            }
            selectElement.addEventListener("change", () => {
                updateSchedule(selectElement.value);
            })
        })
}, 1000);
