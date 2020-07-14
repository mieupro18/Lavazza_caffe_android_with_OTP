const obfuscatingTransformer = require('react-native-obfuscating-transformer');
const filter = filename => {
  return filename.startsWith('src');
};

module.exports = obfuscatingTransformer({
  filter: filter,
  trace: true,
});
