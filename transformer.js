const obfuscatingTransformer = require('react-native-obfuscating-transformer');

const filter = filename => {
  return filename.startsWith('src');
};
module.exports = obfuscatingTransformer({
  obfuscatorOptions: {
    compact: true,
    controlFlowFlattening: false,
    deadCodeInjection: false,
    debugProtection: false,
    debugProtectionInterval: false,
    disableConsoleOutput: true,
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    renameGlobals: false,
    rotateStringArray: true,
    selfDefending: true,
    shuffleStringArray: true,
    splitStrings: false,
    stringArray: true,
    stringArrayEncoding: false,
    stringArrayThreshold: 0.75,
    unicodeEscapeSequence: false,
  },
  upstreamTransformer: require('metro-react-native-babel-transformer'),
  emitObfuscatedFiles: false,
  enableInDevelopment: true,
  filter: filter,
  trace: true,

  /* options */
});
