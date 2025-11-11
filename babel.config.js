module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env', // Cambiar de .env.local a .env
          safe: false,
          allowUndefined: true, // Permitir variables no definidas
        },
      ],
    ],
  };
};