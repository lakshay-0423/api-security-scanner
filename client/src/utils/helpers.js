export const isValidUrl = (urlStr) => {
  try {
    new URL(urlStr);
    return true;
  } catch (_) {
    return false;
  }
};

export const validateSpecFile = (file) => {
  const validExtensions = ['.json', '.yaml', '.yml'];
  const fileName = file.name.toLowerCase();
  const isValidExt = validExtensions.some((ext) => fileName.endsWith(ext));
  if (!isValidExt) {
    return { valid: false, message: 'Invalid file type. Only JSON or YAML/YML specification files are supported.' };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, message: 'File size exceeds the 10 MB limit.' };
  }
  return { valid: true };
};
