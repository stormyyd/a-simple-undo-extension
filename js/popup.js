'use strict'

async function render() {
    let result = await browser.storage.local.get('closedTabs')
    let closedTabs = result.hasOwnProperty('closedTabs') ? result.closedTabs : new Array()
    if(closedTabs.length == 0) {
        document.getElementById('closed_tabs_list').innerHTML = ''
        document.getElementById('no_tabs_info').style.display = 'block'
        return
    }
    document.getElementById('no_tabs_info').style.display = 'none'
    let template = document.querySelector('template#closed_tabs')
    for (let i of closedTabs) {
        let templateContent = template.content
        templateContent.querySelector('div.closed_tabs').id = i.id
        templateContent.querySelector('div.closed_tabs').title = `${i.title}\n${i.url}`
        templateContent.querySelector('p.title').innerHTML = `<img class="favicon" src="${i.favicon}" /> ${i.title}`
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

render()

document.getElementById('clear').addEventListener('click', async function() {
    await browser.storage.local.set({
        closedTabs: []
    })
    render()
})