/**
 * Builds an error object that stores an HTTP error code
 * @private
 * @param text - Error message.
 * @param status - HTTP status
 * @returns {Error}
 */
export default (text, status) => {
    const error = new Error(text)
    error.http_code = status
    return error
}
