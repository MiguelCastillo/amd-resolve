/**
 * Build and file object with the important pieces
 */
function parseParts(fileString) {
  var name;
  var directory = fileString.replace(/([^/]+)$/gmi, function(match) {name = match;return "";});

  return {
    name: name || "",
    directory: directory,
    path: fileString
  };
}


/**
 * Method to add an extension if one does not exist in the fileString.  It does NOT replace
 * the file extension if one already exists in `fileString`.
 *
 * @param {string} fileString - File string to add the extension to if one does not exist
 * @param {string} extension - Extension to add if one does not exist in `fileString`. The
 *   value is the extension without the `.`. E.g. `js`, `html`.  Not `.js`, `.html`.
 * @returns {string} New fileString with the new extension if one did not exist
 */
function addExtension(fileString, extension) {
  var fileName  = parseParts(fileString);
  var fileParts = fileName.name.split(".");

  if (fileParts.length === 1 && extension) {
    fileParts.push(extension);
  }

  return fileName.directory + fileParts.join(".");
}


/**
 * Method that gets the extension from a file path
 *
 * @param {string} fileString - File path to get the extension for.
 *
 * @returns {string} File extension
 */
function getExtension(fileString) {
  var fileParts = fileString.match(/[^.\/\\]+\.([^.]+)$/);
  return fileParts && fileParts[1] || "";
}


/**
 * Method to replace an extension, if one does not exist in the file string, it will be added.
 *
 * @param {string} fileString - File string to add the extension to if one does not exist
 * @param {string} extension - Extension to be either added to `fileString` or to replace the extension in `fileString`. The
 *   value is the extension without the `.`. E.g. `js`, `html`.  Not `.js`, `.html`.
 * @returns {string} fileString with the new extension
 */
function replaceExtension(fileString, extension) {
  var regex = /([^.\/\\]+\.)[^.]+$/;
  if (regex.test(fileString)) {
    return fileString.replace(regex, "$1" + extension);
  }
  else {
    return fileString + "." + extension;
  }
}


module.exports = {
  parseParts: parseParts,
  addExtension: addExtension,
  getExtension: getExtension,
  replaceExtension: replaceExtension
};
