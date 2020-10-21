const assert = require('assert');
const { hasLink, mentionsUser } = require('../../../lib/services/message-matching');

describe('Message matching tests ', function () {
  describe('hasLink matches link-containing messages', function () {
    const goodLinkMessages = [
      'http://mrlinux.com',
      'http://test.tv',
      'https://mrrlinux.dev',
      'ftp://mrlinux.dev',
      'ttt https://mrlinux.dev',
      'ttt https://www.MrLinux.dev/memes',
      'ttt https://wwwwmrlinux.dev/memes wow epic',
      'https://mrlinux.dev:80/memes/?query="escaped"',
      'http://localhost',
      'http://localhost:80',
      'http://localhost:4000',
      'http://memes',
      'test.tv',
      '.test.tv',
      ' testing -- test.tv .test.tv .test.com test.com test..com ...test.com test....test.com test,,,test.com  ,test.com, ',
      '.test.com.',
      '...test.com',
      'test,,,test.com',
      'cool://mrlinux.dev',
      'site:https://mrlinux.dev',
      'https://nice.',
    ];

    // eslint-disable-next-line mocha/no-setup-in-describe
    goodLinkMessages.forEach((msg, i) => {
      it(`hasLink matches link-containing message #${i + 1}`, function () {
        assert.deepStrictEqual(hasLink(msg), true, msg);
      });
    });
  });
  describe('hasLink does not match non-link-containing messages', function () {
    const badLinkMessages = ['random message in chat.', 'https://.....', 'yeah localhost', 'test.'];
    // eslint-disable-next-line mocha/no-setup-in-describe
    badLinkMessages.forEach((msg, i) => {
      it(`hasLink does not match non-link-containing message #${i + 1}`, function () {
        return assert.deepStrictEqual(hasLink(msg), false, msg);
      });
    });
  });

  describe('mentionUser matches actual mentions of a user', function () {
    it('matches #1', function () {
      return assert.deepStrictEqual(mentionsUser('Destiny hi', 'desTiny'), true);
    });
    it('matches #2', function () {
      return assert.deepStrictEqual(mentionsUser('DesTiny hi', 'desTiny'), true);
    });
    it('matches #3', function () {
      return assert.deepStrictEqual(mentionsUser('destiny hi destiny destiny', 'DESTINY'), true);
    });
    it('matches #4', function () {
      return assert.deepStrictEqual(mentionsUser('destiny. hi', 'DESTINY'), true);
    });
    it('matches #5', function () {
      return assert.deepStrictEqual(mentionsUser('destiny, yo gg', 'destiny'), true);
    });
    it('matches #6', function () {
      return assert.deepStrictEqual(mentionsUser('destiny?', 'destiny'), true);
    });
    it('matches #7', function () {
      return assert.deepStrictEqual(mentionsUser('destiny!', 'destiny'), true);
    });
    it('not match #1', function () {
      return assert.deepStrictEqual(mentionsUser('https://destiny!', 'destiny'), false);
    });
    it('not match #2', function () {
      return assert.deepStrictEqual(mentionsUser('destiny.gg', 'destiny'), false);
    });
    it('not match #3', function () {
      return assert.deepStrictEqual(mentionsUser('yodestiny.gg', 'destiny'), false);
    });
    it('not match #4', function () {
      return assert.deepStrictEqual(mentionsUser('yodestiny', 'destiny'), false);
    });
    it('not match #5', function () {
      return assert.deepStrictEqual(mentionsUser('destinyt', 'DESTINY'), false);
    });
  });
});
