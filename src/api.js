'use strict';

import $ from 'jquery';
import './lorem-cn.min.js';
const lorem = window.lorem;
// Do not allow in global space.
window.lorem = undefined;

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

// Mock API.
const apiStatus = 200;
const latency = 100;
const readKeyMockApi = Object.freeze({
  getSubscriptions(done, fail) {
    if (apiStatus != 200) {
      setTimeout(fail.bind(undefined, { responseText: 'getSubscriptions error.', status: apiStatus }), latency);
      return;
    }

    let subs = [];
    for (let i = 0; i < 100; i++) {
      subs.push({ id: i, title: `sub${i}`, unreadCount: i });
    }
    setTimeout(done.bind(undefined, { subscriptions: subs }), latency);
  },

  getFeedEntries(subId, done, fail) {
    if (apiStatus != 200) {
      setTimeout(fail.bind(undefined, { responseText: 'getFeedEntries error.', status: apiStatus }), latency);
      return;
    }

    let items = [];
    for (let i = 0; i < 100; i++) {
      items.push({
        id: subId * 100 + i,
        title: `sub${subId}-item${i}`,
        summary: `sub${subId}-summary${i}`,
      });
    }
    setTimeout(done.bind(undefined, { feeds: items }), latency);
  },

  getFeed(feedId, done, fail) {
    if (apiStatus != 200) {
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
});

export { readKeyMockApi, readKeyApi };