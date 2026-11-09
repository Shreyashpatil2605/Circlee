module.exports = ({ config }) => {
  const isDevelopment = process.env.APP_VARIANT === "development";

  return {
    ...config,
    name: isDevelopment ? "Circlee Dev" : config.name,
    android: {
      ...config.android,
      package: isDevelopment
        ? "com.shreyashpatil.circlee.dev"
        : config.android?.package,
    },
  };
};
