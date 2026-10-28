// Override with --dart-define=API_URL=... (Android emulator: http://10.0.2.2:4000/graphql).
const apiUrl = String.fromEnvironment(
  'API_URL',
  defaultValue: 'http://localhost:4000/graphql',
);
