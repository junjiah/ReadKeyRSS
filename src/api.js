/* global $ */
'use strict';

// Real API.
const apiPrefix = '';
const readKeyApi = Object.freeze({
  getSubscriptions(done, fail) {
    $.ajax({
      type: 'GET',
      url: `${apiPrefix}/subscription`,
    }).done(done).fail(fail);
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

  unsubscribeFeedSource(subId, done, fail) {
    $.ajax({
      type: 'DELETE',
      url: `${apiPrefix}/subscription/${subId}`,
    }).done(done).fail(fail);
  },

  markRead({subId, itemId, read}, done, fail) {
    $.ajax({
      type: 'PUT',
      url: `${apiPrefix}/subscription/${subId}`,
      data: `itemId=${itemId}&read=${read}&markAll=false`,
    }).done(done).fail(fail);
  },

  getUnreadCount(subId, done, fail) {
    $.ajax({
      type: 'GET',
      url: `${apiPrefix}/unreadcount/${subId}`,
    }).done(done).fail(fail);
  },
  
  markAllAsRead(subId, done, fail) {
    $.ajax({
      type: 'PUT',
      url: `${apiPrefix}/subscription/${subId}`,
      data: 'markAll=true', 
    }).done(done).fail(fail);
  },
});

export default readKeyApi;
