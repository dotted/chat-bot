const assert = require('assert');
const sinon = require('sinon');
const moment = require('moment');
const { URL } = require('url');
const LastFm = require('../../../lib/services/lastfm');
const mockResponses = require('./mocks/lastFm-responses.json');

const { hasNowPlaying, hasNoNowPlaying } = mockResponses;

describe('LastFm tests ', function () {
  beforeEach(function () {
    this.clock = sinon.useFakeTimers(1540203694586);
  });

  afterEach(function () {
    this.clock.restore();
  });

  it('can parse last.fm result with a currently playing track', function (done) {
    const lastFm = new LastFm({
      url: 'https://destiny.gg/nice/meme',
      apiKey: 'Big win in the marketplace of ideas',
      username: 'dotted1337',
    });

    lastFm.fetchLastScrobbledTrack = () => {
      return Promise.resolve(hasNowPlaying);
    };

    lastFm.getCurrentPlayingSong().then((result) => {
      assert.deepStrictEqual(result, {
        trackName: 'One Against the World',
        artistName: 'Antti Martikainen',
        nowPlaying: true,
      });
      done();
    });
  });

  it('can parse last.fm result with no currently playing track', function (done) {
    const lastFm = new LastFm({
      url: 'https://destiny.gg/nice/meme',
      apiKey: 'Big win in the marketplace of ideas',
      username: 'dotted1337',
    });

    lastFm.fetchLastScrobbledTrack = () => {
      return Promise.resolve(hasNoNowPlaying);
    };

    lastFm.getCurrentPlayingSong().then((result) => {
      assert.deepStrictEqual(result, {
        trackName: 'Dawnbringer',
        artistName: 'LiquidCinema',
        nowPlaying: undefined,
        playedAgo: moment.duration(-758586),
      });
      done();
    });
  });

  it('can parse last.fm result and return the past played song', function (done) {
    const lastFm = new LastFm({
      url: 'https://destiny.gg/nice/meme',
      apiKey: 'Big win in the marketplace of ideas',
      username: 'dotted1337',
    });

    lastFm.fetchLastScrobbledTrack = () => {
      return Promise.resolve(hasNoNowPlaying);
    };

    lastFm.getPreviousSongPlaying().then((result) => {
      assert.deepStrictEqual(result, {
        lastPlayedTrackName: 'Dawnbringer',
        lastPlayedArtistName: 'LiquidCinema',
        previouslyPlayedTrackName: 'Stratosphere',
        previouslyPlayedArtistName: 'Epic North',
        playedAgo: moment.duration(-141000),
      });
      done();
    });
  });

  it('creates a profile page url', function () {
    const lastFm = new LastFm({
      url: 'https://destiny.gg/nice/meme',
      apiKey: 'Big win in the marketplace of ideas',
      username: 'dotted1337',
    });
    const result = lastFm.getProfilePage();
    assert.deepStrictEqual(result, new URL('https://last.fm/user/dotted1337'));
  });
});
