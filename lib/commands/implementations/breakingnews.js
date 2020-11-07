const moment = require('moment');
const _ = require('lodash');

const Command = require('../command-interface');
const CommandOutput = require('../command-output');
const parseDurationToSeconds = require('../../chat-utils/duration-parser');
const { makeMute } = require('../../chat-utils/punishment-helpers');
const formatDuration = require('../../chat-utils/format-duration');

function breakingNews(defaultCutoffLength, defaultPunishmentDuration) {
  // States: "on" | "off" | "all"
  let state = 'off';
  // The user to be mentioned, if null then don't care about mention
  let mentionUser = null;

  let currentCutoffLength = null;

  let muteDuration = null;

  return (input, services, parsedMessage) => {
    const matched = /(on|off)(?:(?:\s+)(\d+[HMDSWwhmds]))?/.exec(input);
    const newState = _.get(matched, 1, '');
    const duration = _.get(matched, 2, '');
    const cutoffLength = _.get(matched, 3, '');

    let newMuteDuration = defaultPunishmentDuration;
    if (duration !== '') {
      newMuteDuration = parseDurationToSeconds(duration);
      if (newMuteDuration === null) {
        return new CommandOutput(
          null,
          'Could not parse the mute duration. Usage: "!breakingnews {on,off,all} {amount}{m,h,d,w} {amount}{m,h,d,w}" !breakingnews on 10m 5m',
        );
      }
    }

    let newCutoffLength = defaultCutoffLength;
    if (duration !== '') {
      newCutoffLength = parseDurationToSeconds(cutoffLength);
      if (newCutoffLength === null) {
        return new CommandOutput(
          null,
          'Could not parse the cutoff length. Usage: "!breakingnews {on,off} {amount}{m,h,d,w} {amount}{m,h,d,w}" !breakingnews on 10m 5m',
        );
      }
    }

    const newMentionUser = newState === 'on' ? parsedMessage.user : null;
    if (
      newState === state &&
      newMentionUser === mentionUser &&
      currentCutoffLength === newCutoffLength &&
      muteDuration === newMuteDuration
    ) {
      const displayState = state === 'all' ? 'on for all links' : state;
      const displayMentionUser = mentionUser ? ` for mentioning ${mentionUser}` : '';
      const formattedLength = formatDuration(moment.duration(currentCutoffLength, 'seconds'));
      return new CommandOutput(
        null,
        `Breaking news (${formattedLength}) is already ${displayState}${displayMentionUser}`,
      );
    }

    state = newState;
    mentionUser = newMentionUser;
    currentCutoffLength = newCutoffLength;
    muteDuration = newMuteDuration;
    services.messageRelay.stopRelay('breakingnews');
    if (state === 'off') {
      return new CommandOutput(null, `Breaking news turned off`);
    }

    const listener = services.messageRelay.startListenerForChatMessages('breakingnews');

    const formattedDuration = formatDuration(moment.duration(muteDuration, 'seconds'));
    const formattedLength = formatDuration(moment.duration(currentCutoffLength, 'seconds'));
    listener.on('message', (data) => {
      const message = data.message.trim().toLowerCase();
      if (state !== 'all' && !services.messageMatching.mentionsUser(message, mentionUser)) return;
      if (!services.messageMatching.hasLink(message)) return;

      services.messageMatching.getLinks(message).forEach((link) => {
        services.metadata
          .getLinkDate(link)
          .then((date) => {
            const now = moment();
            // round up article date to nearest minute
            const roundedDate = date.add(30, 'seconds').startOf('minute');
            if (now.diff(roundedDate, 'seconds') > currentCutoffLength) {
              services.punishmentStream.write(
                makeMute(
                  data.user,
                  muteDuration,
                  `${data.user} muted for ${formattedDuration} for posting an old link while breaking news is on.`,
                ),
              );
            }
          })
          .catch((error) => {
            if (error.message === 'No date found') {
              services.logger.warn(
                `No date found for link (${link}) during breaking news, please create GitHub issue`,
              );
            } else {
              services.logger.error(error);
            }
          });
      });
    });

    const displayState = state === 'all' ? 'on for all links' : state;
    const displayMentionUser = mentionUser ? ` for mentioning ${mentionUser}` : '';
    return new CommandOutput(
      null,
      `Breaking news (${formattedLength}) turned ${displayState}${displayMentionUser}`,
    );
  };
}

module.exports = {
  breakingnews: new Command(
    breakingNews(300, 600),
    false,
    true,
    /(on|off|all)(?:(?:\s+)(\d+[HMDSWwhmds]))?(?:(?:\s+)(\d+[HMDSWwhmds]))?/,
    false,
  ),
};
