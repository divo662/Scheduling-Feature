import { AppRegistry } from 'react-native';
import App from '../src/App';

// Register the app for web
AppRegistry.registerComponent('dreamverse-scheduling', () => App);

// Start the app
AppRegistry.runApplication('dreamverse-scheduling', {
  initialProps: {},
  rootTag: document.getElementById('root'),
});

