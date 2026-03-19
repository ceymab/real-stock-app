import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { Stock } from 'src/app/models/stock.model';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class StockPriceService implements OnDestroy {
  private stocks: Stock[] = [
    { name: 'Apple', symbol: 'AAPL', price: 190.25, high: 195, low: 185.5, week52High: 210, week52Low: 150, isActive: true, prevPrice: 188.45 },
    { name: 'Alphabet', symbol: 'GOOG', price: 1016.92, high: 1030, low: 1000, week52High: 1200, week52Low: 950, isActive: true, prevPrice: 1002 },
    { name: 'Microsoft', symbol: 'MSFT', price: 57.82, high: 60, low: 55, week52High: 70, week52Low: 50, isActive: true, prevPrice: 55 },
    { name: 'Tesla', symbol: 'TSLA', price: 240.15, high: 245, low: 230, week52High: 300, week52Low: 180, isActive: true, prevPrice: 238 }
  ];

  private stockSubject = new BehaviorSubject<Stock[]>(this.stocks);
  getStockList$ = this.stockSubject.asObservable();
  
  private ws!: WebSocket;
  private mockSubscription!: Subscription;

  constructor() {
    if (environment.useMock) {
      this.startMockImplementation();
    } else {
      this.connectToWebSocket();
    }
  }

  private connectToWebSocket(): void {
    this.ws = new WebSocket('ws://localhost:8080');
    
    this.ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'initial':
        case 'update':
          this.stocks = message.data;
          this.stockSubject.next(this.stocks);
          break;
        case 'toggle':
          this.stocks = this.stocks.map(stock =>
            stock.symbol === message.symbol 
              ? { ...stock, isActive: !stock.isActive } 
              : stock
          );
          this.stockSubject.next(this.stocks);
          break;
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.startMockImplementation();
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
    };
  }

  private startMockImplementation(): void {
    console.log('Using mock implementation');
    this.mockSubscription = interval(3000).subscribe(() => {
      this.stocks = this.stocks.map(stock => {
        if (!stock.isActive) return stock;
        const randomChange = Math.random() * 4 - 2;
        const updatedPrice = stock.price + randomChange;
        const newPrice = Number(updatedPrice.toFixed(2));
        return { ...stock, prevPrice: stock.price, price: newPrice };
      });
      this.stockSubject.next(this.stocks);
    });
  }

  toggleStock(symbol: string): void {
    if (!environment.useMock && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'toggle', symbol: symbol }));
    } else {
      this.stocks = this.stocks.map(stock =>
        stock.symbol === symbol ? { ...stock, isActive: !stock.isActive } : stock
      );
      this.stockSubject.next(this.stocks);
    }
  }

  ngOnDestroy(): void {
    if (this.mockSubscription) {
      this.mockSubscription.unsubscribe();
    }
    if (this.ws) {
      this.ws.close();
    }
  }
}