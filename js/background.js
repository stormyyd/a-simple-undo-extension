'use strict'

var TabsInfo = new Map()

async function getAllTabs() {
    let tabs = await browser.tabs.query({})
    for (let i of tabs) {
        TabsInfo.set(i.id, {
            title: i.title,
            url: i.url,
            favicon: i.favIconUrl
        })
    }
}

async function initBadgeText() {
    let result = await browser.storage.local.get('closedTabs')
    let closedTabs = result.hasOwnProperty('closedTabs') ? result.closedTabs : new Array()
    browser.browserAction.setBadgeText({
        text: closedTabs.length.toString()
    })
}

function onCreated(tabInfo) {
    let info = {
        title: tabInfo.title,
        url: tabInfo.url,
        favicon: tabInfo.favIconUrl
    }
    TabsInfo.set(tabInfo.id, info)
}

function onUpdated(tabId, changeInfo, tabInfo) {
    if(changeInfo.url || changeInfo.title || changeInfo.favIconUrl) {
        let info = {
            title: tabInfo.title,
            url: tabInfo.url,
            favicon: tabInfo.favIconUrl
        }
        TabsInfo.set(tabId, info)
    }
}

async function onRemoved(tabId, removeInfo) {
    if(TabsInfo.get(tabId).url.slice(0, 5) == 'about') {
        TabsInfo.delete(tabId)
        return
    }
    let result = await browser.storage.local.get('closedTabs')
    let closedTabs = result.hasOwnProperty('closedTabs') ? result.closedTabs : new Array()
    closedTabs.push({
        id: tabId,
        title: TabsInfo.get(tabId).title,
        url: TabsInfo.get(tabId).url,
        favicon: TabsInfo.get(tabId).favicon,
        time: new Date().getTime()
    })
    closedTabs.sort((a, b) => a.time > b.time ? -1 : 1)
    await browser.storage.local.set({
        closedTabs: closedTabs
    })
    TabsInfo.delete(tabId)
}

function updateBadge(changes, areaName) {
    if(areaName != 'local' || !changes.hasOwnProperty('closedTabs')) return
    browser.browserAction.setBadgeText({
        text: changes.closedTabs.newValue.length.toString()
    })
}

getAllTabs()
initBadgeText()

browser.tabs.onCreated.addListener(onCreated)
browser.tabs.onUpdated.addListener(onUpdated)
browser.tabs.onRemoved.addListener(onRemoved)
browser.storage.onChanged.addListener(updateBadge)