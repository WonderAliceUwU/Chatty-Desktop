module.exports = {
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        iconUrl: 'file:///src/Images/Icons/icon.ico',
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
      config: {
        icon: 'path/to/your/icon.icns',
      },
    },
    // ... other makers
  ],
};
