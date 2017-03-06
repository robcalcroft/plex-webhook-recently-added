#!/usr/bin/env node
require('dotenv').load();
const info = require('./package.json');
const request = require('request');
const moment = require('moment');

const debug = process.env.NODE_ENV === 'production' ? () => {} : console.log; // eslint-disable-line no-console
const signInUrl = process.env.SIGN_IN_URL || 'https://plex.tv/users/sign_in.json';

if (!process.env.WEBHOOKS || process.env.WEBHOOKS.length < 1) {
  throw new Error('No webhook(s) provided! Add them in .env');
}

if (!process.env.PLEX_URL) {
  throw new Error('No Plex URL provided! Add it in .env');
}

if (!process.env.USERNAME) {
  throw new Error('No Plex username provided! Add it in .env');
}

if (!process.env.PASSWORD) {
  throw new Error('No Plex password provided! Add it in .env');
}

debug(`${new Date()}`, `Requesting ${signInUrl}`);

request.post({
  url: signInUrl,
  form: {
    'user[login]': process.env.USERNAME,
    'user[password]': process.env.PASSWORD,
  },
  headers: {
    'X-Plex-Client-Identifier': process.env.UUID || '48a766bc-45ac-40e0-a0f6-c62a6bce42d4',
    'X-Plex-Product': info.name,
    'X-Plex-Version': info.version,
    'X-Plex-Device-Name': process.env.NAME || info.name,
    Accept: 'application/json',
  },
}, (loginError, loginResult, login) => {
  if (loginError) {
    return debug(`${new Date()}`, `Error retrieving token, status ${loginResult && loginResult.statusCode} - `, loginError);
  }

  const user = JSON.parse(login).user;
  const token = user.authentication_token;
  const port = process.env.PLEX_PORT || 32400;
  const url = `${process.env.PLEX_URL}:${port}/library/recentlyAdded`;

  debug(`${new Date()}`, `Requesting ${url}`);

  return request({
    url,
    headers: {
      'X-Plex-Token': token,
      Accept: 'application/json',
    },
  }, (recentlyAddedError, recentlyAddedResult, recentlyAdded) => {
    if (recentlyAddedError) {
      return debug(`${new Date()}`, `Error getting recently added, status ${recentlyAddedResult && recentlyAddedResult.statusCode} - `, recentlyAddedError);
    }

    const items = JSON.parse(recentlyAdded).MediaContainer.Metadata;
    const oneDayAgo = moment().subtract(process.env.UPDATED_AT_FILTER_VALUE || 1, process.env.UPDATED_AT_FILTER_UNIT || 'days');
    const addedWithinLastDay = items.filter(item => moment.unix(item.addedAt).isAfter(oneDayAgo));
    const formattedItems = addedWithinLastDay.map((item) => {
      let name;
      if (item.type === 'movie') {
        name = item.title;
      } else if (item.type === 'season') {
        name = `${item.parentTitle} ${item.title}`;
      } else {
        name = `${item.title} (${item.type})`;
      }
      return name;
    });

    return JSON.parse(process.env.WEBHOOKS).forEach((webhook) => {
      debug(`${new Date()}`, `Running webhook ${webhook}`);
      request.post({
        url: webhook,
        timeout: 10000,
        body: formattedItems,
        json: true,
      });
    });
  });
});
