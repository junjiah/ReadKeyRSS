/* global $ */
'use strict';

import { readKeyMockApi, readKeyApi } from './api.js'; 

/***************************************************************
 * Global objects.
 ***************************************************************/

const globalObj = {
  focusedFeedSourceEle: null,
  focusedFeedEntryEle: null,
};
// For local development.
let api = readKeyMockApi;

/***************************************************************
 * Custom elements.
 ***************************************************************/

function buildFeedSourceElement(sub) {
  const id = sub.id;
  // Let the anchor behave like normal ones without href.
  let ele = $(`<a class="list-group-item">${sub.title}</a>`);
  if (sub.unreadCount > 0) {
    ele = ele.append(`<span class="badge">${sub.unreadCount}</span>`);
  }
  ele.click(() => {
    attachFeedEntries(id);
    if (globalObj.focusedFeedSourceEle) {
      globalObj.focusedFeedSourceEle.removeClass('focused');
    }
    ele.addClass('focused');
    globalObj.focusedFeedSourceEle = ele;
  });
  return ele;
}

function buildFeedEntryElement(item) {
  const id = item.id;
  const title = item.title;
  // Let the anchor behave like normal ones without href.
  let ele = $(`
        <a class="list-group-item">
          <h5 class="list-group-item-heading">${title}</h5>
          <p class="list-group-item-text">${item.summary}</p>
        </a>
      `);
  ele.click(() => {
    attachFeedItem(id, title);
    if (globalObj.focusedFeedEntryEle) {
      globalObj.focusedFeedEntryEle.removeClass('focused');
    }
    ele.addClass('focused');
    globalObj.focusedFeedEntryEle = ele;
  });
  return ele;
}

/***************************************************************
 * Custom events.
 ***************************************************************/

// Executed on page ready.
function attachFeedSourceList(subs) {
  // The `subscriptions` field may be null according to gin's responses.
  if (!subs.subscriptions) {
    return;
  }
  const subList = subs.subscriptions.reduce((acc, sub) => {
    return acc.add(buildFeedSourceElement(sub));
  }, $());

  $('#feed-source-list-data')
    .empty()
    .append(subList);
}

// Event handler for clicking on feed source.
function attachFeedEntries(subId) {
  const done = data => {
    const itemList = data.feeds.reduce((acc, item) => {
      return acc.add(buildFeedEntryElement(item));
    }, $());

    let len = data.feeds.length;
    $('#feed-item-list-footer-info')
      .text(`${len} item${len > 1 ? 's' : ''}`);

    $('#feed-item-list-data')
      .empty()
      .append(itemList);
  };
  const fail = () => { alert('get feed entries failed.'); };

  api.getFeedEntries(subId, done, fail);
}

// Event handler for clicking on feed entry.
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

function subscribe() {
  const inputEle = $('#add-subscription-input');
  let url = inputEle.val();
  // TODO: Check whether the URL makes sense.
  const done = sub => {
    // Clear input's value.
    inputEle.val('');
    $('#feed-source-list-data')
      .append(buildFeedSourceElement(sub));
  };
  const fail = () => { alert('subscribe failed.'); };
  api.subscribeFeedSource(url, done, fail);
}

/***************************************************************
 * Preparation when document is ready.
 ***************************************************************/
 
// When document is ready.
$(() => {
  // Event handler for the subscription adding button.
  $('#add-subscription-button').click(subscribe);
  
  // Fetch subscription list.
  const fail = () => { alert('get subscriptions failed.'); };
  api.getSubscriptions(attachFeedSourceList, fail);
});
