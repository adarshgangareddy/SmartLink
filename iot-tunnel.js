const ngrok = require('ngrok');

(async function() {
  try {
    console.log('🔄 Starting SmartLink IoT Tunnel...');
    
    // Kill any existing tunnels first
    await ngrok.kill();
    
    const url = await ngrok.connect({
      addr: 8000,
      proto: 'http',
      authtoken: '3CrdpGQdLgmpKo2HbckVNOqihly_4warac7VQHayLwyo9CPsH'
    });

    console.log('\n-------------------------------------------');
    console.log('🚀 SmartLink IoT Tunnel Started!');
    console.log(`📡 Public URL: ${url}`);
    console.log('-------------------------------------------');
    console.log('Copy this URL into your Arduino code as serverUrl.');
    console.log('Press Ctrl+C to stop the tunnel.');

  } catch (err) {
    console.log('\n❌ Error starting ngrok.');
    console.error(err.message);
    console.log('\nTry running: npx ngrok http 8000 --authtoken 3CrdpGQdLgmpKo2HbckVNOqihly_4warac7VQHayLwyo9CPsH');
  }
})();
