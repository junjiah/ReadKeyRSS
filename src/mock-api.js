'use strict';

const normalMockApi = Object.freeze({
  getSubscriptions() {
    return {
      subscriptions: [
        { id: 0, title: '知乎日报', unreadCount: 12 },
        { id: 1, title: '湾区日报', unreadCount: 4 },
        { id: 2, title: 'Engadget', unreadCount: 25 },
        { id: 3, title: 'The Verge', unreadCount: 0 },
      ]
    }
  },

  getFeeds(subId) {
    switch (subId) {
      case 0:
        return {
          feeds: [
            { id: 0, title: '深夜惊奇·字字高能预警', summary: '医生遇到过哪些「这些都能活下来」...' },
            { id: 1, title: '深夜惊奇·许悦韬爸爸', summary: '你妈炸了！...' },
            { id: 2, title: '瞎扯·丹神之章', summary: '老张有一天...' },
          ]
        };
      case 1:
        return {
          feeds: [
            { id: 10, title: 'Uber 技术栈', summary: '如果你去了 Uber...' },
            { id: 11, title: 'Airbnb 倒霉记', summary: '如果你去了 Airbnb...' },
          ]
        };
      case 2:
        return {
          feeds: [
            { id: 20, title: 'Apple sucks!', summary: 'Google is the future...' },
            { id: 21, title: 'Google sucks!', summary: 'Apple is the future...' },
          ]
        };
      case 3:
        return {
          feeds: [
            { id: 30, title: 'iPad Pro is worse than Surface book', summary: 'Microsoft is the future...' },
          ]
        };
    }
  }
});

const longContentMockApi = Object.freeze({
  getSubscriptions() {
    let subs = [];
    for (let i = 0; i < 100; i++) {
      subs.push({ id: i, title: `sub${i}`, unreadCount: i });
    }
    return { subscriptions: subs };
  },

  getFeeds(subId) {
    let items = [];
    for (let i = 0; i < 100; i++) {
      items.push({ id: subId * 100 + i, title: `sub${subId}-item${i}`, summary: `sub${subId}-summary${i}` });
    }
    return { feeds: items };
  }
});

export { normalMockApi, longContentMockApi };