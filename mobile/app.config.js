const { configureMetaTracking } = require('./plugins/metaTrackingConfig');

// Credentials are supplied by the local/EAS build environment, never extra or JS.
module.exports = ({ config }) => configureMetaTracking(config, process.env);
