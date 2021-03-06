'use strict'

function escapeHtml(str) {
    let entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;'
    };
    return str.replace(/[&<>"'\/]/g, function (s) {
        return entityMap[s];
    });
}

async function render(closedTabs = undefined) {
    document.getElementById('closed_tabs_list').innerHTML = ''
    if(closedTabs == undefined) {
        let result = await browser.storage.local.get('closedTabs')
        closedTabs = result.hasOwnProperty('closedTabs') ? result.closedTabs : new Array()
    }
    if(closedTabs.length == 0) {
        document.getElementById('no_tabs_info').style.display = 'block'
        return
    }
    document.getElementById('no_tabs_info').style.display = 'none'
    let template = document.getElementById('closed_tabs_template')
    for (let i of closedTabs) {
        let templateContent = template.content
        templateContent.querySelector('div.closed_tabs').id = i.id
        templateContent.querySelector('div.closed_tabs').title = `${i.title}\n${i.url}`
        if(i.favicon == undefined) i.favicon = browser.extension.getURL('icons/default_ico.svg')
        templateContent.querySelector('p.title').innerHTML = `<img class="favicon" src="${i.favicon}" /> ${escapeHtml(i.title)}`
        templateContent.querySelector('p.url').innerHTML = i.url
        document.getElementById('closed_tabs_list').appendChild(document.importNode(templateContent, true))
    }
    for (let i of document.querySelectorAll('div.closed_tabs')) {
        i.addEventListener('click', async function() {
            browser.tabs.create({
                url: this.children[1].innerHTML
            })
            let result = await browser.storage.local.get('closedTabs')
            let closedTabs = result.closedTabs
            for (let [index, value] of closedTabs.entries()) {
                if(value.id == parseInt(this.id)) {
                    closedTabs.splice(index, 1);
                    break
                }
            }
            browser.storage.local.set({
                closedTabs: closedTabs
            })
            window.close()
        })
    }
}

async function search(event) {
    let searchString = event.target.value
    let result = await browser.storage.local.get('closedTabs')
    let closedTabs = result.hasOwnProperty('closedTabs') ? result.closedTabs : new Array()
    let searchResult = new Array()
    for (let i of closedTabs) {
        if(i.title.indexOf(searchString) != -1) {
            searchResult.push(i)
        }
    }
    render(searchResult)
}

render()
document.getElementById('clear').addEventListener('click', async function() {
    await browser.storage.local.set({
        closedTabs: []
    })
    window.close()
})
document.getElementById('search_bar').addEventListener('input', search)
