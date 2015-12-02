'use strict';

import './lorem-cn.min.js';
const lorem = window.lorem;
// Do not allow in global space.
window.lorem = undefined;

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

const apiStatus = Object.freeze({
  getSubscriptions: 200,
  getFeedEntries: 200,
  getFeed: 200,
  subscribeFeedSource: 200,
  markRead: 200,
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
      subs.push({ id: i, title: `sub${i}` });
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

    // Add one unusual feed source with 100 entries.
    let itemNum = subId == feedSourceNum - 1 ? 100 : subId;
    for (let i = 0; i < itemNum; i++) {
      const summary = lorem(getRandomInt(10, 30));
      items.push({
        id: subId * 100 + i,
        title: `sub${subId}-item${i}`,
        summary: summary,
        keywords: `kw${i},keyword${i},关键词${i},キーワード${i}`,
      });
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
    let id = feedSourceNum - 1;
    const result = Object.freeze({ id: id, title: `sub${id}` });
    setTimeout(done.bind(undefined, result), latency);
  },

  markRead({subId, itemId, read}, done, fail) {
    if (apiStatus.markRead != 200) {
      setTimeout(fail.bind(undefined, { 
        responseText: 'markRead error.', 
        status: apiStatus.markRead, 
      }), latency);
    }
    
    setTimeout(done, latency);
  },
});

export default readKeyMockApi;