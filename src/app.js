'use strict';

import $ from 'jquery';

import { normalMockApi, longContentMockApi } from './mock-api.js';

// let api = normalMockApi;
let api = longContentMockApi;

function attachFeedSourceList(subs) {
  // let subList = $();
  // subs.subscriptions.forEach(sub => {
  const subList = subs.subscriptions.reduce((acc, sub) => {
    let ele = $(`<a href="#" class="list-group-item">${sub.title}</a>`);
    if (sub.unreadCount > 0) {
      ele = ele.append(`<span class="badge">${sub.unreadCount}</span>`);
    }
    ele.click(() => {
      attachFeedItemList(sub.id);
    });
    return acc.add(ele);
  }, $());
  
  $('.feed-source-list')
    .empty()
    .append(subList);
}

function attachFeedItemList(subId) {
  const done = data => {
    const itemList = data.feeds.reduce((acc, item) => {
      let ele = $(`
        <a href="#" class="list-group-item">
          <h5 class="list-group-item-heading">${item.title}</h5>
          <p class="list-group-item-text">${item.summary}</p>
        </a>
      `);
      return acc.add(ele);
    }, $());
    
    $('.feed-item-list')
      .empty()
      .append(itemList);
  };
  const fail = () => { alert('get feeds failed.'); };
  
  api.getFeeds(subId, done, fail);
}

// When document is ready.
$(() => {
  const fail = () => { alert('get subscriptions failed.'); };
  api.getSubscriptions(attachFeedSourceList, fail);
});
