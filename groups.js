
let HTMLParser = require('node-html-parser');
let XMLHttpRequest = require('xhr2');

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

function getGroups(){
    let readyStateCount = 0;
    let result = { groups: [] };
    for (let i = 1; i < 6; i++) {
        let request = new XMLHttpRequest();
        let url = "https://ssau.ru/rasp/faculty/492430598?course=" + i;

        request.open("GET", url, true);
        request.send(null);
        request.onreadystatechange = () => {
            if (request.readyState == 4) {
                let root = HTMLParser.parse(request.responseText);
                let groups = root.querySelectorAll(".group-catalog__groups > a");
                for (let group of groups) {
                    result.groups.push({ name: group.innerText, link: `/rasp${getElementId(group)}` })
                }
                readyStateCount++;
                if (readyStateCount === 5){
                    require("fs").writeFile('groups.json', JSON.stringify(result), 'utf8', (err) => {
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

getGroups();