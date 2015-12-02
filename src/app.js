/* global $ */
'use strict';

import 'babel-polyfill';

// For local development.
import api from './mock-api.js';

/***************************************************************
 * Global objects.
 ***************************************************************/

const globalObj = {
  // Focused feed-related records of type `{ $ele, id }`.
  focusedFeedSource: null,
  focusedFeedEntry: null,
};

/***************************************************************
 * Custom elements and element operations.
 ***************************************************************/

function buildFeedSourceElement(sub) {
  const id = sub.id;
  // Let the anchor behave like normal ones without href.
  let $ele = $(`<a class="list-group-item">${sub.title}</a>`);
  // Reset globally focused element.
  if (globalObj.focusedFeedSource && globalObj.focusedFeedSource.id === id) {
    $ele.addClass('focused');
    globalObj.focusedFeedSource.$ele = $ele;
  }

  $ele.click(() => {
    showLogoAsFeedContent();
    attachFeedEntries(id);
    if (globalObj.focusedFeedSource) {
      globalObj.focusedFeedSource.$ele.removeClass('focused');
    }
    $ele.addClass('focused');
    globalObj.focusedFeedSource = { $ele, id };
  });
  return $ele;
}

function buildFeedEntryElement(item) {
  const id = item.id;
  const title = item.title;

  // Let the anchor behave like normal ones without href.
  let $ele = $(`
        <a class="list-group-item">
          <img class="pull-right" />
          <h5 class="list-group-item-heading">${title}</h5>
          <p class="list-group-item-text">${item.summary}</p>
        </a>
      `);
  $ele.find('img').attr('src', require('../assets/checkmark.svg'));
  // Regain globally focused element.
  if (globalObj.focusedFeedEntry && globalObj.focusedFeedEntry.id === id) {
    $ele.addClass('focused');
    globalObj.focusedFeedEntry.$ele = $ele;
  }

  $ele.click((e) => {
    if (e.target.tagName == 'IMG') {
      // Clicking the checkmark, mark as read.
      markAsRead({ itemId: id, $ele });
      // Remove global record if matches.
      if (globalObj.focusedFeedEntry && globalObj.focusedFeedEntry.id === id) {
        globalObj.focusedFeedEntry = null;
      }
      return;
    };
    
    // Otherwise, regard as normal clicking to attach feed item.
    // TODO: Maybe these should be fetched before clicking.
    attachFeedItem(id, title);
    if (globalObj.focusedFeedEntry) {
      globalObj.focusedFeedEntry.$ele.removeClass('focused');
    }
    $ele.addClass('focused');
    globalObj.focusedFeedEntry = { $ele, id };
  });
  return $ele;
}

function showLogoAsFeedContent() {
  $('#feed-title')
    .empty();
  $('#feed-content')
    .empty();
  // TODO: Add logo.
}

function updateUnreadCount(len) {
  $('#feed-item-list-footer-info')
    .text(`${len} item${len > 1 ? 's' : ''}`);
  if (globalObj.focusedFeedSource) {
    const $ele = globalObj.focusedFeedSource.$ele;
    const $badge = $ele.find('span.badge');
    if ($badge.length == 0) {
      if (len > 0) {
        $ele.append(`<span class="badge">${len}</span>`);
      }
    } else {
      if (len == 0) {
        $badge.remove();
      } else {
        $badge.text(String(len));
      }
    }
  }
}

/***************************************************************
 * Custom events.
 ***************************************************************/

// Executed on page ready.
function attachFeedSourceList() {
  return new Promise((resolve, reject) => {
    const done = subs => {
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

      resolve();
    };
    const fail = () => {
      alert('get subscriptions failed.');
      reject();
    };

    api.getSubscriptions(done, fail);
  });
}

// Event handler for clicking on feed source.
function attachFeedEntries(subId) {
  return new Promise((resolve, reject) => {
    const done = data => {
      const itemList = data.feeds.reduce((acc, item) => {
        return acc.add(buildFeedEntryElement(item));
      }, $());

      updateUnreadCount(data.feeds.length);

      $('#feed-item-list-data')
        .empty()
        .append(itemList);

      resolve();
    };
    const fail = () => {
      alert('get feed entries failed.');
      reject();
    };

    api.getFeedEntries(subId, done, fail);
  });
}

// Event handler for clicking on feed entry.
function attachFeedItem(feedId, feedTitle) {
  return new Promise((resolve, reject) => {
    const done = data => {
      const $titleEle = $(`<h1><a href="${data.link}" target="_blank">${feedTitle}</a></h1>`);
      const $contentEle = $(data.content);
      // Let each link open in a new tab/window.
      $contentEle.find('a').attr('target', '_blank');

      $('#feed-title')
        .empty()
        .append($titleEle);
      $('#feed-content')
        .empty()
        .append($contentEle);

      resolve();
    };
    const fail = () => {
      alert('get feed item failed.');
      reject();
    };

    api.getFeed(feedId, done, fail);
  });
}

function subscribe(e) {
  e.preventDefault();
  const $inputEle = $('#add-subscription-input');
  let url = $inputEle.val();
  $('#add-subscription-modal').modal('hide');
  // TODO: Check whether the URL makes sense.
  return new Promise((resolve, reject) => {
    const done = sub => {
      // Clear input's value.
      $inputEle.val('');
      $('#feed-source-list-data')
        .append(buildFeedSourceElement(sub));

      resolve();
    };
    const fail = () => {
      alert('subscribe failed.');
      reject();
    };
    api.subscribeFeedSource(url, done, fail);
  });
}

function markAsRead({ itemId, $ele }) {
  // Ignore if no focused feed source.
  if (!globalObj.focusedFeedSource) {
    return;
  }
  const subId = globalObj.focusedFeedSource.id;
  const read = true;

  return new Promise((resolve, reject) => {
    const done = () => {
      showLogoAsFeedContent();
      $ele.remove();

      updateUnreadCount($('#feed-item-list-data').children().length);

      resolve();
    };
    const fail = () => {
      alert('mark as read failed.');
      reject();
    };
    api.markRead({ subId, itemId, read }, done, fail);
  });
}

/***************************************************************
 * Preparation when document is ready.
 ***************************************************************/
 
// When document is ready.
$(() => {
  // Fetch subscription list.
  const refresh = () => {
    attachFeedSourceList();
    if (globalObj.focusedFeedSource) {
      attachFeedEntries(globalObj.focusedFeedSource.id);
    }
  };

  // Event handler for the subscription adding modal.
  $('#add-subscription-button').click(subscribe);
  $('#add-subscription-form').submit(subscribe);
  $('#add-subscription-modal').on('shown.bs.modal', () => {
    $('#add-subscription-input').focus();
  });
  // Event handler for the refreshing button.
  $('#feed-source-list-refresh').click(refresh);
  // Event handler for the mark read button.
  $('#feed-item-mark-read').click(e => {
    if (!globalObj.focusedFeedEntry) {
      return;
    }
    const feedEntry = {
      itemId: globalObj.focusedFeedEntry.id,
      $ele: globalObj.focusedFeedEntry.$ele,
    };
    globalObj.focusedFeedEntry = null;
    markAsRead(feedEntry);
  });

  // Adjust dynamic UI issues.
  // TODO: Seems unstable.
  const feedItemWidth = $(document).width() - $('.feed-item-list').width() - $('.feed-source-list').width();
  $('#feed-item-header').width(feedItemWidth);
  $('#feed-item-footer').width(feedItemWidth);

  // Init page loading.
  refresh();
});
