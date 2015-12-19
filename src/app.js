/* global $ */
/* eslint-env node */
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
 * Helper functions.
 ***************************************************************/

// Credits to: 
// http://stackoverflow.com/questions/1353684/detecting-an-invalid-date-date-instance-in-javascript
function isValidDate(date) {
  if (Object.prototype.toString.call(date) !== '[object Date]') {
    return false;
  }
  return !isNaN(date.getTime());
}


// A helper function receiving a Date object (usually in UTC) and transform to
// the string of format 'yyyy-mm-dd hh:mm:ss' in local time.
function formatDate(date) {
  // Wrap date attributes which should be padded to two digits.
  let wrap = {
    month: date.getMonth(),
    date: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
  };
  // Add padding.
  for (let attr in wrap) {
    let val = wrap[attr];
    if (val < 10) {
      wrap[attr] = '0' + val;
    }
  }

  const day = `${date.getFullYear() }-${wrap.month}-${wrap.date}`;
  const time = `${wrap.hour}:${wrap.minute}:${wrap.second}`;
  return `${day} ${time}`;
}


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

  $ele.click((e) => {
    // Ignore if is clicking remove button.
    if (e.target.classList.contains('feed-source-remove')) {
      return;
    }
    showLogoAsFeedContent();
    attachFeedEntries(id);
    if (globalObj.focusedFeedSource) {
      globalObj.focusedFeedSource.$ele.removeClass('focused');
    }
    $ele.addClass('focused');
    globalObj.focusedFeedSource = { $ele, id };
  });

  showUnreadBadge($ele, id);
  
  // Add remove icon to unsubscribe. 
  const $editIcon = $('<span class="glyphicon glyphicon-minus feed-source-remove" aria-hidden="false"></span>');
  $editIcon.click(() => {
    const done = () => {
      $ele.find('span').fadeOut(500);
      removeElementAnimated('feed-source-disappear', $ele);
      if (globalObj.focusedFeedSource.id === id) {
        $('#feed-item-list-data').empty();
        $('#feed-title').empty();
        $('#feed-content').empty();
        globalObj.focusedFeedSource = null;
        globalObj.focusedFeedEntry = null;
      }
    };
    const fail = () => {
      alert('unsubscribe failed.');
    };
    api.unsubscribeFeedSource(id, done, fail);
  });

  $ele.prepend($editIcon);

  return $ele;
}

function buildFeedEntryElement(item) {
  const { id, title, pubDate } = item;
  const parsedDate = new Date(pubDate);
  let displayDate = '';
  if (isValidDate(parsedDate)) {
    displayDate = formatDate(parsedDate);
  }
  let keywords = item.keywords.split(',').join(', ');

  // Let the anchor behave like normal ones without href.
  // TODO: Center the checkmark.
  let $ele = $(`
        <a class="list-group-item">
          <img class="pull-right" />
          <h5 class="list-group-item-heading">${title}</h5>
          <p class="list-group-item-text feed-entry-date">${displayDate}</p>
          <p class="list-group-item-text feed-entry-keywords">${keywords}</p>
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
    }
    
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

function showUnreadBadge($ele, subId) {
  const done = cnt => {
    const len = Number(cnt);
    const $badge = $ele.find('span.badge');
    if ($badge.length == 0 && len > 0) {
      $ele.append(`<span class="badge">${len}</span>`);
    }
    // TODO: If no unread item, should the feed source element be removed?
  };
  // Ignore errors.
  const fail = () => { };
  api.getUnreadCount({ subId }, done, fail);
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

function removeElementAnimated(animationName, $ele) {
  const height = $ele.css('height');
  $.keyframe.define([{
    name: animationName,
    '0%': {
      height,
    },
    '60%': {
      transform: 'translateX(200%)',
      '-webkit-transform': 'translateX(200%)',
      height,
      'padding-top': 0,
      'padding-bottom': 0,
    },
    '100%': {
      transform: 'translateX(200%)',
      height: 0,
      'padding-top': 0,
      'padding-bottom': 0,
    },
  }]);
  $ele.playKeyframe(`${animationName} 1s ease-in-out`, () => {
    $ele.remove();
  });
}

/***************************************************************
 * Custom events.
 ***************************************************************/

// Executed when refresh, fetch subscribed feed sources.
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

      let feeds = [...data.feeds];
      // Sorted by date, on top is the most recent. Invalid date won't change the order.
      feeds.sort((e1, e2) => {
        return new Date(e2.pubDate).getTime() - new Date(e1.pubDate).getTime();
      });

      const itemList = feeds.reduce((acc, item) => {
        return acc.add(buildFeedEntryElement(item));
      }, $());

      updateUnreadCount(feeds.length);

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
      const $contentEle = $(`<div>${data.content}</div>`);
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
      const newUnreadCount = $('#feed-item-list-data').children().length - 1;
      $ele.css('min-height', '0');
      $ele.find('img').fadeOut(500);
      removeElementAnimated('feed-entry-disappear', $ele);

      updateUnreadCount(newUnreadCount);

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

function refresh() {
  console.log('refresh');
  attachFeedSourceList();
  if (globalObj.focusedFeedSource) {
    attachFeedEntries(globalObj.focusedFeedSource.id);
  }
} 
 
// When document is ready.
$(() => {
  // Attach logo.
  let $logoImage = $('#readkey-logo-img');
  $logoImage.attr('src', require('../assets/logo.png'));

  // Event handler for the subscription adding modal.
  $('#add-subscription-button').click(subscribe);
  $('#add-subscription-form').submit(subscribe);
  $('#add-subscription-modal').on('shown.bs.modal', () => {
    $('#add-subscription-input').focus();
  });
  // Event handler for the refreshing button.
  $('#feed-source-list-refresh').click(refresh);
  // Event handler for subscription editing button.
  $('#feed-source-list-edit').click(() => {
    const $sources = $('#feed-source-list-data .feed-source-remove');
    if ($sources.css('visibility') == 'hidden') {
      $sources.css('visibility', 'visible');
      $sources.fadeTo('slow', 1);
    } else {
      $sources.fadeTo('fast', 0, () => {
        $sources.css('visibility', 'hidden');
      });
    }
  });

  // Some dynamic css properties, e.g. the fixed header in feed content.
  const leftSpace = $('.feed-source-list').width() + $('.feed-item-list').width();
  $('#feed-item-header').css('left', `${leftSpace}px`);
  $('#feed-item-footer').css('left', `${leftSpace}px`);

  // Init page loading.
  refresh();
});
