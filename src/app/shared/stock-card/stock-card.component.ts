import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Stock } from 'src/app/models/stock.model';

@Component({
  selector: 'app-stock-card',
  templateUrl: './stock-card.component.html',
  styleUrls: ['./stock-card.component.css']
})
export class StockCardComponent {
  @Input() stock!: Stock;
  @Input() isMobile: boolean = false;
  @Output() toggle = new EventEmitter<void>();

  getCardColor(): string {
    if (!this.stock.isActive) return '#e0e0e0';
    if (this.stock.prevPrice === undefined) return 'white';
    return this.stock.price > this.stock.prevPrice ? '#4caf50' : '#f44336';
  }

  getPriceChange(): string {
    if (this.stock.prevPrice === undefined) return '';
    const diff = this.stock.price - this.stock.prevPrice;
    const percent = (diff / this.stock.prevPrice) * 100;
    const sign = diff >= 0 ? '+' : '';
    return `${sign}${diff.toFixed(2)} (${sign}${percent.toFixed(2)}%)`;
  }

  toggleStock() {
    this.toggle.emit();
  }
}
