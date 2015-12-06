'use strict';

import './lorem-cn.min.js';
const lorem = window.lorem;
// Do not allow in global space.
window.lorem = undefined;

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

const apiStatus = Object.freeze({
  getSubscriptions: 200,
  getFeedEntries: 200,
  getFeed: 200,
  subscribeFeedSource: 200,
  markRead: 200,
  getUnreadCount: 200,
});
const latency = 100;
let feedSourceNum = 10;
// Mock API.
const readKeyMockApi = Object.freeze({
  getSubscriptions(done, fail) {
    if (apiStatus.getSubscriptions != 200) {
      setTimeout(fail.bind(undefined, {
        responseText: 'getSubscriptions error.',
        status: apiStatus.getSubscriptions,
      }), latency);
      return;
    }

    let subs = [];
    for (let i = 0; i < feedSourceNum; i++) {
      subs.push({ id: String(i), title: `sub${i}` });
    }
    setTimeout(done.bind(undefined, { subscriptions: subs }), latency);
  },

  getFeedEntries(subId, done, fail) {
    if (apiStatus.getFeedEntries != 200) {
      setTimeout(fail.bind(undefined, {
        responseText: 'getFeedEntries error.',
        status: apiStatus.getFeedEntries,
      }), latency);
      return;
    }

    let items = [];

    // Special feed item entries without keywords or time.
    if (subId == feedSourceNum - 2) {
      for (let i = 0; i < subId; i++) {
        items.push({
          id: String(subId * 100 + i),
          title: `sub${subId}-item${i}-nokw-nodate`,
          keywords: '',
          pubDate: '',
        });
      }
    } else {
      // Another special feed item entries.
      let itemNum = subId == feedSourceNum - 1 ? 100 : subId;
      for (let i = 0; i < itemNum; i++) {
        items.push({
          id: String(subId * 100 + i),
          title: `sub${subId}-item${i}`,
          keywords: `kw${i},keyword${i},关键词${i},キーワード${i}`,
          pubDate: randomDate(new Date(2012, 0, 1), new Date()).toUTCString(),
        });
      }
    }
    setTimeout(done.bind(undefined, { feeds: items }), latency);
  },

  getFeed(feedId, done, fail) {
    if (apiStatus.getFeed != 200) {
      setTimeout(fail.bind(undefined, {
        responseText: 'getFeed error.',
        status: apiStatus.getFeed,
      }), latency);
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
      setTimeout(fail.bind(undefined, {
        responseText: 'subscribe error.',
        status: apiStatus.subscribeFeedSource,
      }), latency);
      return;
    }

    // Update number of feed sources.
    feedSourceNum++;
    let id = String(feedSourceNum - 1);
    const result = Object.freeze({ id, title: `sub${id}` });
    setTimeout(done.bind(undefined, result), latency);
  },

  markRead(_, done, fail) {
    if (apiStatus.markRead != 200) {
      setTimeout(fail.bind(undefined, {
        responseText: 'markRead error.',
        status: apiStatus.markRead,
      }), latency);
    }

    setTimeout(done, latency);
  },

  getUnreadCount(_, done, fail) {
    if (apiStatus.getUnreadCount != 200) {
      setTimeout(fail.bind(undefined, {
        responseText: 'getUnreadCount error.',
        status: apiStatus.getUnreadCount,
      }), latency);
      return;
    }

    const result = getRandomInt(0, 5);
    setTimeout(done.bind(undefined, String(result)), latency);
  },
});

export default readKeyMockApi;
