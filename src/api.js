/* global $ */
'use strict';

import './lorem-cn.min.js';
const lorem = window.lorem;
// Do not allow in global space.
window.lorem = undefined;

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

// Mock API.
const apiStatus = Object.freeze({
  getSubscriptions: 200,
  getFeedEntries: 200,
  getFeed: 200,
  subscribeFeedSource: 200,
});
const latency = 100;
let feedSourceNum = 10;
const readKeyMockApi = Object.freeze({
  getSubscriptions(done, fail) {
    if (apiStatus.getSubscriptions != 200) {
      setTimeout(fail.bind(undefined, { responseText: 'getSubscriptions error.', status: apiStatus }), latency);
      return;
    }

    let subs = [];
    for (let i = 0; i < feedSourceNum; i++) {
      subs.push({ id: i, title: `sub${i}`, unreadCount: i });
    }
    setTimeout(done.bind(undefined, { subscriptions: subs }), latency);
  },

  getFeedEntries(subId, done, fail) {
    if (apiStatus.getFeedEntries != 200) {
      setTimeout(fail.bind(undefined, { responseText: 'getFeedEntries error.', status: apiStatus }), latency);
      return;
    }

    let items = [];
    // Add one unusual feed source with 100 entries.
    let itemNum = subId == feedSourceNum - 1 ? 100 : subId;
    for (let i = 0; i < itemNum; i++) {
      const summary = lorem(getRandomInt(10, 30));
      items.push({
        id: subId * 100 + i,
        title: `sub${subId}-item${i}`,
        summary: summary,
      });
    }
    setTimeout(done.bind(undefined, { feeds: items }), latency);
  },

  getFeed(feedId, done, fail) {
    if (apiStatus.getFeed != 200) {
      setTimeout(fail.bind(undefined, { responseText: 'getFeed error.', status: apiStatus }), latency);
      return;
    }

    let content = '';
    for (let i = 0; i < 100; i++) {
      const text = lorem(getRandomInt(50, 200));
      content += `<p>${text}</p>`;
    }
    const result = Object.freeze({
      link: 'https://google.com',
      content: content,
    });
    setTimeout(done.bind(undefined, result), latency);
  },

  subscribeFeedSource(url, done, fail) {
    if (apiStatus.subscribeFeedSource != 200) {
      setTimeout(fail.bind(undefined, { responseText: 'subscribe error.', status: apiStatus }), latency);
      return;
    }
    // Update number of feed sources.
    feedSourceNum++;
    let id = feedSourceNum - 1;
    const result = Object.freeze({ id: id, title: `sub${id}`, unreadCount: id });
    setTimeout(done.bind(undefined, result), latency);
  },
});

// Real API.
const apiPrefix = '';
const readKeyApi = Object.freeze({
  getSubscriptions(done, fail) {
    $.ajax({
      type: 'GET',
      url: `${apiPrefix}/subscription`,
    }).done(data => {
      done(data);
    }).fail(fail);
  },

  getFeedEntries(subId, done, fail) {
    $.ajax({
      type: 'GET',
      url: `${apiPrefix}/subscription/${subId}`,
    }).done(done).fail(fail);
  },

  getFeed(feedId, done, fail) {
    $.ajax({
      type: 'GET',
      url: `${apiPrefix}/feed/${feedId}`,
    }).done(done).fail(fail);
  },

  subscribeFeedSource(url, done, fail) {
    $.ajax({
      type: 'POST',
      url: `${apiPrefix}/subscription`,
      data: `url=${url}`,
    }).done(done).fail(fail);
  },
});

export { readKeyMockApi, readKeyApi };