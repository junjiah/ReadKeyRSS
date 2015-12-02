/* global $ */
'use strict';

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

  markRead({subId, itemId, read}, done, fail) {
    $.ajax({
      type: 'PUT',
      url: `${apiPrefix}/subscription/${subId}`,
      data: `itemId=${itemId}&read=${read}`,
    }).done(done).fail(fail);    
  },
});

export default readKeyApi;