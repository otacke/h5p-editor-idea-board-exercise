import libraryJson from '@root/library.json';

/**
 * Get the machine name of the H5P library.
 * @returns {string} Machine name of the library.
 */
export const getMachineName = () => {
  return libraryJson.machineName;
};

/**
 * Translate a string in the Idea Board context.
 * @param {string} key Translation key.
 * @param {object} [vars] Placeholder variables.
 * @returns {string} Translated string.
 */
export const translate = (key, vars) => {
  return H5PEditor.t(getMachineName(), key, vars);
};
