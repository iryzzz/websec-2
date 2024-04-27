let express = require('express');
let path = require('path');
let app = express();
let bp = require('body-parser');

app.use(express.static(__dirname + '/static'));
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));
app.get('/', function(_, response) {
    response.sendFile(path.join(__dirname, 'index.html'));
});
require('http').Server(app).listen(8000);

function isNumber(char) {
    return (typeof char !== 'string' || char.trim() === '')? false : !isNaN(char);
}

function getElementId(elem){
    let ind1 = 0;
    while (!isNumber(elem.toString()[ind1]) && ind1 < 100) ind1++;
    let ind2 = ind1;
    while (isNumber(elem.toString()[ind2]) && ind2 < 100) ind2++;
    while (elem.toString()[ind1] !== "?" && ind1 > 0) ind1--;
    let id = elem.toString().slice(ind1, ind2);
    return id;
}

app.get('/rasp', (req, res) => {
    let XMLHttpRequest = require('xhr2');
    let request = new XMLHttpRequest();
    request.open("GET", "https://ssau.ru" + req.url, true);
    request.send(null);
    request.onreadystatechange = () => {
        if (request.readyState == 4) {
            let schedule = {
                dates: [],
                daysOfSchedule: [],
                times: []
            };
            let root = require('node-html-parser').parse(request.responseText);
            for (let cell of root.querySelectorAll(".schedule__item + .schedule__head")) {
                schedule.dates.push(cell.childNodes[0].innerText + cell.childNodes[1].innerText);
            }
            for (let cell of root.querySelectorAll(".schedule__item")) {
                if (cell.childNodes[0]?.childNodes.length > 3) {
                    let groups = [];

                    let groupsElements = ((typeof req.query.staffId === "undefined"))? 
                        cell.childNodes[0].childNodes[3].childNodes : cell.querySelectorAll("a");

                    groupsElements.filter((group) => group.innerText.trim() !== "")
                        .map((group) => {
                            let id = getElementId(group);

                            groups.push(JSON.stringify({
                                name: group.innerText,
                                link: isNumber(id[id.length - 4]) ? `/rasp${id}` : null
                            }))
                        });
            
                    let id = ((typeof req.query.staffId === "undefined"))? 
                        getElementId(cell.childNodes[0].childNodes[2].childNodes) : "";

                    schedule.daysOfSchedule.push({
                        subject: cell.childNodes[0].childNodes[0].innerText.slice(1),
                        place: cell.childNodes[0].childNodes[1].innerText.slice(1),
                        teacher: JSON.stringify(typeof req.query.staffId === "undefined" ? 
                            {
                            name: cell.querySelector(".schedule__teacher")?.innerText ?? 
                                cell.childNodes[0].childNodes[2].childNodes[0].innerText,
                            link: isNumber(id[id.length - 1]) ? `/rasp${id}` : null } : { name: "", link: "" }),
                        groups: groups
                    });
                } else {
                    schedule.daysOfSchedule.push({
                        subject: null
                    });
                }
            }
            for (let cell of root.querySelectorAll(".schedule__time")) {
                schedule.times.push(cell.childNodes[0].innerText + "\n" + cell.childNodes[1].innerText);
            }
            schedule.daysOfSchedule = schedule.daysOfSchedule.slice(7);
            schedule.currentWeek = root.querySelector(".week-nav-current_week")?.innerText.slice(1, 3).trim();
            res.send(JSON.stringify(schedule));
        }
    };
});

app.get('/getGroups', (_, res) => res.sendFile(path.join(__dirname, 'groups.json')));
app.get('/getTeachers', (_, res) => res.sendFile(path.join(__dirname, 'teachers.json')));