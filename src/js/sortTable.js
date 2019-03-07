const table = document.querySelector('table');

table.onclick = function (event) {
    const elem = event.target;
    if (elem.nodeName == 'TH') {
        const index = elem.cellIndex;
        const type = elem.getAttribute('data-type');
        const sort = elem.classList.contains('sort');
        const active = document.querySelector('.sort-active');

        if (sort) {
            if (active) {
                let arrow = active.querySelector('span');

                active.classList.remove('sort-active');
                active.removeChild(arrow);
            }

            elem.classList.add('sort-active');
            elem.innerHTML += '<span>&#8595;</span>';

            sortTable(index, type);
        }
    }
}

function sortTable(index, type) {
    const tbody = table.getElementsByTagName('tbody')[0];

    const compare = function (rowA, rowB) {
        const sellsA = rowA.cells[index].innerText;
        const sellsB = rowB.cells[index].innerText;

        switch (type) {
            case 'amount':
                return sellsA.replace('$', '') - sellsB.replace('$', '');
                break;
            case 'date':
                const dateA = rowA.cells[index].getAttribute('data-date');
                const dateB = rowB.cells[index].getAttribute('data-date');

                return dateA - dateB;
                break;
            case 'string':
                if (sellsA > sellsB) return 1;
                if (sellsA < sellsB) return -1;
                return 0;
                break;
        }
    }


    let rows = [].slice.call(tbody.rows);

    rows.sort(compare);

    table.removeChild(tbody);

    for (let i = 0; i < rows.length; i++) {
        tbody.appendChild(rows[i]);
    }

    table.appendChild(tbody);
}
