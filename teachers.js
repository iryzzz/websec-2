let HTMLParser = require('node-html-parser');
let XMLHttpRequest = require('xhr2');

function parseTeachers() {
    let teachersString = [];
    let result = { teachers: [] };
    let readyStateCount = 0;
    for (let i = 1; i < 123; i++) {
        let request = new XMLHttpRequest();
        let url = "https://ssau.ru/staff?page=" + i;
        request.open("GET", url, true);
        request.send(null);
        request.onreadystatechange = () => {
            if (request.readyState == 4) {
                teachersString.push(request.responseText);
                readyStateCount++;
                if (readyStateCount === 122) {
                    for (let teacher of teachersString) {
                        let root = HTMLParser.parse(teacher);
                        let teachers = root.querySelectorAll(".list-group-item > a");
                        for (let t of teachers) {
                            let staffId = t.getAttribute("href").replace(/\D/g, '');
                            result.teachers.push({ name: t.innerText, link: `/rasp?staffId=${staffId}` });
                        }
                    }
                    require("fs").writeFile('teachers.json', JSON.stringify(result), 'utf8', (err) => {
                        if (err) {
                            console.log('Error on writing file');
                        }
                        console.log('saved');
                    });
                }
            }
        };
    }
}
parseTeachers();