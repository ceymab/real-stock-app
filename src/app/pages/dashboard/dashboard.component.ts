import { Component, OnInit, HostListener } from '@angular/core';
import { Observable } from 'rxjs';
import { StockPriceService } from 'src/app/core/services/stock-price.service';
import { Stock } from 'src/app/models/stock.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  getStockList$!: Observable<Stock[]>;
  isMobile: boolean = false;

  constructor(private stockService: StockPriceService) { }

  ngOnInit(): void {
    this.getStockList$ = this.stockService.getStockList$;
    this.detectViewMode();
  }

  @HostListener('window:resize')
  detectViewMode() {
    this.isMobile = window.innerWidth <= 767;
  }

  onToggle(symbol: string) {
    this.stockService.toggleStock(symbol);
  }

  trackBySymbol(index: number, stock: Stock): string {
  return stock.symbol;
}

}
