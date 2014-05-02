function InstagramApiError(message, res) {
  this.message = message || 'InstagramApiError';
  this.res = res || undefined;
}

InstagramApiError.prototype = new Error();

module.exports = InstagramApiError;
