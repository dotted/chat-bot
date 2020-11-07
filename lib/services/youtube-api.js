const { google } = require('googleapis');
const GoogleDeviceAuth = require('google-device-auth');

/**
 * @typedef OnUserCodeSuccess
 * @type {Object}
 * @property {string} device_code
 * @property {number} expires_in
 * @property {number} interval
 * @property {string} user_code
 * @property {string} verification_url
 *
 * @typedef OnUserCodeFailure
 * @type {Object}
 * @property {string} error_code
 */

/**
 * @param {OnUserCodeSuccess | OnUserCodeFailure} data
 */
function handleUserCode(data) {}

class YoutubeApi {
  /**
   * @param {import("../services/service-index")} services
   */
  constructor(configuration, services) {
    this.configuration = configuration;
    this.logger = services.logger;
    this.sql = services.sql;
    google.auth.OAuth2()
    google.youtube({auth: })
  }

  init() {
    this.sql.getYoutubeRefreshToken()
    this.auth = new GoogleDeviceAuth({
      clientId: this.configuration.clientId,
      clientSecret: this.configuration.clientSecret,
      scopes: ['https://www.googleapis.com/auth/youtube.readonly'],
    });

    this.auth.on(GoogleDeviceAuth.events.userCode, (data) => {
      if (data.error_code) {
        this.logger.error(`Failed to get user code when authing YouTube: ${data.error_code}`);
        return;
      }
      this.logger.warn(
        `Please visit this URL: ${data.verification_url} and enter this code: ${data.user_code} to auth YouTube`,
      );
    });

    this.auth.on(GoogleDeviceAuth.events.authSuccess, (data) => {
      // Store response access token and refresh token for use with other libraries
      this.accessToken = data.access_token;
      this.logger.debug('Auth success! Access token: ', this.accessToken);
    });

    return new Promise((accept, reject) => {
      const result = this.auth.auth();
      if (result instanceof Error) {
        reject(result);
      }
      accept(result);
    });
  }
}

module.exports = YoutubeApi;
