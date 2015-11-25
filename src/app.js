'use strict';

import $ from 'jquery';

import { readKeyMockApi, readKeyApi } from './api.js'; 

// For local development.
let api = readKeyMockApi;

function attachFeedSourceList(subs) {
  if (!subs) {
    return;
  }
  const subList = subs.subscriptions.reduce((acc, sub) => {
    const id = sub.id;
    let ele = $(`<a class="list-group-item">${sub.title}</a>`);
    if (sub.unreadCount > 0) {
      ele = ele.append(`<span class="badge">${sub.unreadCount}</span>`);
    }
    ele.click(() => {
      attachFeedEntries(id);
    });
    return acc.add(ele);
  }, $());
  
  $('#feed-source-list-data')
    .empty()
    .append(subList);
}

function attachFeedEntries(subId) {
  const done = data => {
    const itemList = data.feeds.reduce((acc, item) => {
      const id = item.id;
      const title = item.title;
      let ele = $(`
        <a class="list-group-item">
          <h5 class="list-group-item-heading">${title}</h5>
          <p class="list-group-item-text">${item.summary}</p>
        </a>
      `);
      ele.click(() => {
        attachFeedItem(id, title);
      });
      return acc.add(ele);
    }, $());
    
    $('#feed-item-list-data')
      .empty()
      .append(itemList);
  };
  const fail = () => { alert('get feed entries failed.'); };
  
  api.getFeedEntries(subId, done, fail);
}

function attachFeedItem(feedId, feedTitle) {
  const done = data => {
    const titleEle = $(`<h1><a href="${data.link}">${feedTitle}</a></h1>`);

    $('#feed-title')
      .empty()
      .append(titleEle);
    $('#feed-content')
      .empty()
      .append(data.content);
  };
  const fail = () => { alert('get feed item failed.'); };
  
  api.getFeed(feedId, done, fail);
}

// When document is ready.
$(() => {
  const fail = () => { alert('get subscriptions failed.'); };
  api.getSubscriptions(attachFeedSourceList, fail);
});
