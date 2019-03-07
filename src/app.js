require('./style.scss');
require('./js/sortTable.js');

var orderArr = require('../data/orders.json');
var usersArr = require('../data/users.json');
var companiesArr = require('../data/companies.json');
var table = document.querySelector('table');
var search = document.getElementById('search');

search.onkeyup = function () {
    let value = this.value;

    let arr = orderArr.filter(function (order) {
        let user = usersArr.filter((user) => user.id == order.user_id);
        let current = user[0].first_name + ' ' + user[0].last_name + order.id + order.transaction_id + order.total + order.card_type + order.order_country + order.order_ip;
        let reg = new RegExp(value, 'i');

        return reg.test(current);
    });

    removeSort();
    createTable(arr);
}

function createTable(orders) {
    let tbody = table.getElementsByTagName('tbody')[0];
    let ordersTotal = 0;
    let medianValue;
    let medianValueArr = [];
    let averageCheck = 0;
    let averageCheckMale = 0;
    let averageCheckFemale = 0;

    if (tbody.innerHTML !== '') {
        tbody.innerHTML = '';
    }

    let nothingFound = `<tr><td colspan="7" class="nothing-found">Nothing found</td></tr>`;

    if (orders.length == 0) {
        tbody.innerHTML = nothingFound;
    }

    for (let i = 0; i < orders.length; i++) {
        let tr = document.createElement('tr');
        let date = getDate(orders[i].created_at);
        let card = replaceCardNumber(orders[i].card_number);
        let user = getUser(orders[i].user_id)[0];
        let company = getCompany(user.company_id)[0];
        let gender = user.gender == 'Male' ? 'Mr.' : 'Ms.';
        let birthday = getUserBirthday(user);
        let cells = `
        <td>${orders[i].transaction_id}</td>
        <td class="user_data">
            <a href="#" class="nameLink">${gender} ${user.first_name} ${user.last_name}</a>
            <div class="user-details">
            <a href="#" class="close-details"></a>
                ${birthday}
                ${checkAvatar(user.avatar)}
                ${checkCompany(company)}
            </div>
        </td>
        <td data-date="${orders[i].created_at}">${date}</td>
        <td>$${orders[i].total}</td>
        <td>${card}</td>
        <td>${orders[i].card_type}</td>
        <td>${orders[i].order_country} (${orders[i].order_ip})</td>`;

        ordersTotal += Math.round(+orders[i].total * 100);
        medianValueArr.push(+orders[i].total);
        if (user.gender == 'Male') averageCheckMale += Math.round(+orders[i].total * 100);
        if (user.gender == 'Female') averageCheckFemale += Math.round(+orders[i].total * 100);

        tr.id = 'order_' + orders[i].id;
        tr.innerHTML = cells;
        tbody.appendChild(tr);
    }

    ordersTotal = ordersTotal / 100;
    medianValue = getMedianValue(medianValueArr);
    averageCheck = Math.round((ordersTotal / orders.length) * 100) / 100;
    averageCheckFemale = averageCheckFemale / 100;
    averageCheckMale = averageCheckMale / 100;

    buildTfoot(orders.length, ordersTotal, medianValue, averageCheck, averageCheckFemale, averageCheckMale);
};

createTable(orderArr);



function replaceCardNumber(cardNumber) {
    let cardNumberArr = cardNumber.split('');

    for (let i = 0; i < cardNumberArr.length; i++) {
        if (i > 1 && i < cardNumberArr.length - 4) {
            cardNumberArr[i] = '*';
        }
    }

    return cardNumberArr.join('');
}

function getDate(date) {
    let receivedDate = new Date(+date),
        day = receivedDate.getDate(),
        month = receivedDate.getMonth() + 1,
        year = receivedDate.getFullYear(),
        hours = receivedDate.getHours(),
        minutes = receivedDate.getMinutes(),
        seconds = receivedDate.getSeconds(),
        prefix = hours >= 12 ? 'PM' : 'AM';

    hours = hours >= 12 ? hours - 12 : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds} ${prefix}`;
}

function getUser(id) {
    return usersArr.filter((users) => users.id == id);
}

function getCompany(id) {
    return companiesArr.filter((company) => company.id == id);
}

function checkAvatar(avatar) {
    return avatar ? `<p><img src="${avatar}" width="100px"></p>` : '';
}

function checkCompany(company) {
    return company ? `<p>Company: <a href="${company.url}" target="_blank">${company.title}</a></p>
                      <p>Industry: ${company.industry}</p>` : '';
}

function getUserBirthday(user) {
    if (user.birthday) {
        let date = new Date(+user.birthday),
            day = date.getDate(),
            month = date.getMonth() + 1,
            yaer = date.getFullYear();
        day = day < 10 ? '0' + day : day;
        month = month < 10 ? '0' + month : month;

        return `<p>Birthday: ${day}/${month}/${yaer}</p>`;
    }
}

let nameLink = document.getElementsByClassName('nameLink');

for (let i = 0; i < nameLink.length; i++) {
    nameLink[i].onclick = function (event) {
        event.preventDefault();
        let details = this.nextElementSibling;
        var visible = document.getElementsByClassName('visible');
        if (visible.length > 0 && visible[0] !== details) {
            visible[0].classList.remove('visible');
        }
        details.classList.toggle('visible');
    }
}

function buildTfoot(ordersCount, ordersTotal, medianValue, averageCheck, averageCheckMale, averageCheckFemale) {
    let tfoot = table.querySelector('tfoot');
    let rows = `
                <tr>
                    <td>Orders Count</td>
                    <td colspan="6">${ordersCount}</td>
                </tr>
                <tr>
                    <td>Orders Total</td>
                    <td colspan="6">$ ${ordersTotal}</td>
                </tr>
                <tr>
                    <td>Median Value</td>
                    <td colspan="6">$ ${medianValue}</td>
                </tr>
                <tr>
                    <td>Average Check</td>
                    <td colspan="6">$ ${averageCheck}</td>
                </tr>
                <tr>
                    <td>Average Check (Female)</td>
                    <td colspan="6">$ ${averageCheckMale}</td>
                </tr>
                <tr>
                    <td>Average Check (Male)</td>
                    <td colspan="6">$ ${averageCheckFemale}</td>
                </tr>`;

    tfoot.innerHTML = rows;
}

function getMedianValue(median) {
    let medianValue;
    let compare = function (a, b) {
        return a - b;
    }
    median.sort(compare);

    if (median.length % 2) {
        medianValue = median[Math.ceil((median.length - 1) / 2)];
        medianValue = Math.round(medianValue * 100) / 100
    } else {
        medianValue = (median[(median.length / 2) - 1] + median[median.length / 2]) / 2;
        medianValue = Math.round(medianValue * 100) / 100
    }

    return medianValue;
}

function removeSort() {
    let sortActive = document.querySelector('.sort-active');

    if (sortActive) {
        let arrow = sortActive.querySelector('span');

        sortActive.classList.remove('sort-active');
        arrow.remove();
    }
}
