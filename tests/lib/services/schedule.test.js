const assert = require('assert');
const proxyquire = require('proxyquire').noCallThru();
const mockResponses = require('./mocks/google-calendar-responses.json');

describe('Schedule Tests', function () {
  const config = {
    GOOGLE_CALENDAR_API_KEY: 'TEST123',
    GOOGLE_CALENDAR_ID: 'i54j4cu9pl4270asok3mqgdrhk@group.calendar.google.com',
  };

  const pathStub = function () {};
  let schedule = null;
  before(function () {
    pathStub.calendar = function (configuration) {
      return {
        events: {
          list(payload) {
            return Promise.resolve({
              data: mockResponses.getEventList,
            });
          },
        },
      };
    };

    const ScheduleProxy = proxyquire('../../../lib/services/schedule', {
      googleapis: { google: pathStub },
    });
    schedule = new ScheduleProxy(config);
  });

  it('Gets a Calendars List Of Events as an Array', function () {
    return schedule.getListOfUpcomingEvents(config.GOOGLE_CALENDAR_ID).then(function (response) {
      return assert.equal(Array.isArray(response), true);
    });
  });

  it('Returns a Calendars Next "Stream" event', function () {
    return schedule.findNextStreamDay().then(function (response) {
      return assert.deepStrictEqual(response, {
        start: { dateTime: '2018-11-12T17:00:00-06:00', timeZone: 'America/Chicago' },
        name: 'Stream',
      });
    });
  });
});
