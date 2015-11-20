'use strict';

import $ from 'jquery';

import './style.css';
import { normalMockApi, longContentMockApi } from './mock-api.js';

let api = normalMockApi;
// let api = longContentMockApi;

function attachFeedSourceList(subs) {
  let subList = $();
  subs.subscriptions.forEach(sub => {
    let ele = $(`<a href="#" class="list-group-item">${sub.title}</a>`);
    if (sub.unreadCount > 0) {
      ele = ele.append(`<span class="badge">${sub.unreadCount}</span>`);
    }
    ele.click(() => {
      attachFeedItemList(sub.id);
    });
    subList = subList.add(ele);
  });
  $('.feed-source-list')
    .empty()
    .append(subList);
}

function attachFeedItemList(subId) {
  let itemList = $();
  api.getFeeds(subId).feeds.forEach(item => {
    let ele = $(`
      <a href="#" class="list-group-item">
        <h5 class="list-group-item-heading">${item.title}</h5>
        <p class="list-group-item-text">${item.summary}</p>
      </a>`);
    itemList = itemList.add(ele);
  });
  $('.feed-item-list')
    .empty()
    .append(itemList);
}

// When document is ready.
$(() => {
  attachFeedSourceList(api.getSubscriptions());
});
