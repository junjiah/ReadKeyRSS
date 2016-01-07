/* global $ */
/* eslint-env node */
'use strict';

import 'babel-polyfill';

// For local development.
import api from './mock-api.js';
import { renderTwitterShare, renderPocketShare } from './vendor/share.js';

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
 * Custom elements and UI procedures.
 ***************************************************************/

function buildFeedSourceElement(sub) {
  const id = sub.id;

  // Let the anchor behave like normal ones without href.
  let $ele = $(`<a class="list-group-item"><span class="feed-source-title">${sub.title}</span></a>`);

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
      $ele.slideUp(500, () => {
        $ele.remove();
      });
      if (globalObj.focusedFeedSource.id === id) {
        fadeOutThenEmpty($('#feed-item-list-data'));
        fadeOutThenEmpty($('#feed-title'));
        fadeOutThenEmpty($('#feed-content'));
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
  const keywords = item.keywords.split(',').join(', ');

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
      return;
    }
    
    // Otherwise, regard as normal clicking to attach feed item.
    if (globalObj.focusedFeedEntry && globalObj.focusedFeedEntry.id === id) {
      // Ignore if already focused.
      return;
    }
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
  fadeOutThenEmpty($('#feed-title'));
  fadeOutThenEmpty($('#feed-content'));
  $('#feed-item-readkey-logo-img').fadeIn(100);
  globalObj.focusedFeedEntry = null;
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
  api.getUnreadCount(subId, done, fail);
}

function updateUnreadCount(len) {
  $('#feed-item-list-info')
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

function fadeOutThenEmpty($ele, time = 300) {
  return new Promise(resolve => {
    const children = $ele.children();
    if (children.length == 0) {
      resolve($ele);
    } else {
      children.fadeOut(time, () => {
        $ele.empty();
        resolve($ele);
      });
    }
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
      const $subList = subs.subscriptions.reduce((acc, sub) => {
        return acc.add(buildFeedSourceElement(sub));
      }, $());

      $('#feed-source-list-data')
        .empty()
        .append($subList);

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

      let feeds;
      if (data.feeds === null) {
        // In Go, empty slice may be marshalled as null.
        feeds = [];
      } else {
        feeds = [...data.feeds];
      }
      // Sorted by date, on top is the most recent. Invalid date won't change the order.
      feeds.sort((e1, e2) => {
        return new Date(e2.pubDate).getTime() - new Date(e1.pubDate).getTime();
      });

      const $itemList = feeds.reduce((acc, item) => {
        return acc.add(buildFeedEntryElement(item));
      }, $());

      updateUnreadCount(feeds.length);

      fadeOutThenEmpty($('#feed-item-list-data'), 100)
        .then(($ele) => {
          $ele.fadeToggle(0).append($itemList).fadeToggle(100);
        });

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
  // Dismiss the logo inside feed item section, and it's ok to dismiss even when it's already hidden.
  $('#feed-item-readkey-logo-img').fadeOut(100);
  return new Promise((resolve, reject) => {
    const done = data => {
      const $titleEle = $(`<h1><a href="${data.link}" target="_blank">${feedTitle}</a></h1>`);
      const $contentEle = $(`<div>${data.content}</div>`);
      // Let each link open in a new tab/window.
      $contentEle.find('a').attr('target', '_blank');

      fadeOutThenEmpty($('#feed-title'), 100)
        .then(($ele) => {
          $ele.append($titleEle.fadeToggle(0).fadeToggle(100));
        });

      fadeOutThenEmpty($('#feed-content'), 100)
        .then(($ele) => {
          $ele.scrollTop(0);
          $ele.append($contentEle.fadeToggle(0).fadeToggle(100));
        });

      resolve();
    };
    const fail = () => {
      alert('get feed item failed.');
      reject();
    };

    api.getFeed(feedId, done, fail);
  });
}

// Subscribe to a feed source after inputting the desired URL.
function subscribe(e) {
  e.preventDefault();
  const $inputEle = $('#add-subscription-input');
  let url = $inputEle.val().trim();
  $('#add-subscription-modal').modal('hide');
  const done = sub => {
    // Clear input's value.
    $inputEle.val('');
    $('#feed-source-list-data')
      .append(buildFeedSourceElement(sub));
  };
  const fail = jqXHR => {
    let msg;
    if (jqXHR.responseText) {
      msg = JSON.parse(jqXHR.responseText).error;
    } else {
      msg = 'subscribe failed';
    }
    alert(msg);
  };
  api.subscribeFeedSource(url, done, fail);
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
      if (globalObj.focusedFeedEntry && globalObj.focusedFeedEntry.id === itemId) {
        showLogoAsFeedContent();
      }

      const newUnreadCount = $('#feed-item-list-data').children().length - 1;
      $ele.find('img').fadeOut(500);
      removeElementAnimated('feed-entry-disappear', $ele);
      $ele.css('min-height', '0');

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

function markAllAsRead() {
  // Ignore if no focused feed source.
  if (!globalObj.focusedFeedSource) {
    return;
  }

  // Seems no need to use promises.
  const subId = globalObj.focusedFeedSource.id;
  const done = () => {
    showLogoAsFeedContent();
    let $feedItemListItems = $('#feed-item-list-data > a.list-group-item');
    removeElementAnimated("feed-entry-disappear-all", $feedItemListItems);
    updateUnreadCount(0);
  };
  const fail = () => {
    alert("mark all as read failed.")
  };
  api.markAllAsRead(subId, done, fail);
}

function share(e) {
  e.stopPropagation();
  // Ignore if no currently focused feed item.
  if (globalObj.focusedFeedEntry == null) {
    return;
  }

  const $dropdown = $('#feed-item-share-dropdown');
  const alreadyOpen = $dropdown.parent()[0].classList.contains('open');
  // Toggle and return if already open.
  if (alreadyOpen) {
    $dropdown.dropdown('toggle');
    return;
  }

  $dropdown.empty();

  // Get the link to the focused article.
  const $titleEle = $('#feed-title a');
  const link = $titleEle.attr('href');
  const title = $titleEle.text();
  // Populate the link to sharing buttons.
  $dropdown.append(`
    <li>
      <a class="twitter-share-button"
        href="https://twitter.com/intent/tweet"
        data-url="${link}"
        data-text="「${title}」, shared from ReadKey" />
    </li>
    <li>
      <a data-pocket-label="pocket" data-pocket-count="none" data-save-url="${link}" class="pocket-btn" data-lang="en" />
    </li>
  `);
  // Render the button using vendor scripts.
  renderTwitterShare();
  renderPocketShare();
  // Wait some time for rendering.
  setTimeout(() => $dropdown.dropdown('toggle'), 500);
}

/***************************************************************
 * Preparation when document is ready.
 ***************************************************************/

function refresh() {
  attachFeedSourceList();
  if (globalObj.focusedFeedSource) {
    attachFeedEntries(globalObj.focusedFeedSource.id);
  }
} 
 
// When document is ready.
$(() => {
  // Attach logo.
  $('#readkey-logo-img').attr('src', require('../assets/logo.png'));
  $('#feed-item-readkey-logo-img').attr('src', require('../assets/book.png'));

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
  // Event handler for the sharing button.
  $('#feed-item-share').click(share);
  // Event handler for marking all as read.
  $('#feed-item-list-markall').click(markAllAsRead);

  // Some dynamic css properties, e.g. the fixed header in feed content, load after a short period.
  setTimeout(() => {
    const leftSpace = $('.feed-source-list').width() + $('.feed-item-list').width();
    $('#feed-item-header').css('left', `${leftSpace}px`);
    $('#feed-item-footer').css('left', `${leftSpace}px`);
  }, 100);

  // Init page loading.
  refresh();
});
