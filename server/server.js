const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

const API_KEY = 'USE API KEY';
const SYMBOLS = ['AAPL', 'GOOG', 'MSFT', 'TSLA'];
const UPDATE_INTERVAL = 30000; // 30 seconds (free tier limit: 250/day)

const MOCK_STOCKS = [
  { name: 'Apple', symbol: 'AAPL', price: 190.25, high: 195, low: 185.5, week52High: 210, week52Low: 150, isActive: true, prevPrice: 188.45 },
  { name: 'Alphabet', symbol: 'GOOG', price: 1016.92, high: 1030, low: 1000, week52High: 1200, week52Low: 950, isActive: true, prevPrice: 1002 },
  { name: 'Microsoft', symbol: 'MSFT', price: 57.82, high: 60, low: 55, week52High: 70, week52Low: 50, isActive: true, prevPrice: 55 },
  { name: 'Tesla', symbol: 'TSLA', price: 240.15, high: 245, low: 230, week52High: 300, week52Low: 180, isActive: true, prevPrice: 238 }
];

async function fetchRealStockData() {
  try {
    const response = await fetch(`https://financialmodelingprep.com/stable/quote?symbol=${SYMBOLS.join(',')}&apikey=${API_KEY}`);
    const data = await response.json();
    
    return data.map(item => ({
      name: item.name,
      symbol: item.symbol,
      price: item.price,
      high: item.dayHigh,
      low: item.dayLow,
      week52High: item.yearHigh,
      week52Low: item.yearLow,
      prevPrice: item.previousClose || (item.price - item.change),
      isActive: true
    }));
  } catch (error) {
    console.error('Error fetching real data:', error);
    return null;
  }
}

wss.on('connection', (ws) => {
  console.log('Client connected');
  

  fetchRealStockData().then(stocks => {
    if (stocks) {
      ws.send(JSON.stringify({ type: 'initial', data: stocks }));
    } else {
      ws.send(JSON.stringify({ type: 'initial', data: MOCK_STOCKS }));
    }
  });

 
  const interval = setInterval(async () => {
    const stocks = await fetchRealStockData();
    if (stocks) {
      ws.send(JSON.stringify({ type: 'update', data: stocks }));
    }
  }, UPDATE_INTERVAL);


  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'toggle') {
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ 
              type: 'toggle', 
              symbol: data.symbol 
            }));
          }
        });
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    clearInterval(interval);
    console.log('Client disconnected');
  });
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`✅ WebSocket server running on ws://localhost:${PORT}`);
  console.log(`📊 Fetching data for: ${SYMBOLS.join(', ')}`);
});