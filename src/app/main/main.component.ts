import {
 AfterViewInit,
 ChangeDetectionStrategy,
 ChangeDetectorRef,
 Component,
 inject,
 OnDestroy,
 OnInit,
 ViewChild
} from '@angular/core';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {CommonModule} from '@angular/common';
import {MatNativeDateModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatExpansionModule} from '@angular/material/expansion';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {Subject, takeUntil} from 'rxjs';
import {mockOrders} from './orders.mock';
import {MY_FORMATS} from '../date-formats';
import {provideMomentDateAdapter} from '@angular/material-moment-adapter';


export interface Order {
 status: string;
 orderNumber: string;
 productLine: string;
 productName: string;
 quantity: string;
 dateRequested: string;
}

@Component({
 selector: 'app-main',
 templateUrl: './main.component.html',
 styleUrls: ['./main.component.scss'],
 standalone: true,
 changeDetection: ChangeDetectionStrategy.OnPush,
 imports: [
  CommonModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatSortModule,
  MatTableModule,
  ReactiveFormsModule,
  MatCheckboxModule,
  MatIconModule,
  MatButtonModule,
  MatExpansionModule,
 ],
 providers: [
  provideMomentDateAdapter(MY_FORMATS),
 ]
})
export class MainComponent implements OnInit, AfterViewInit, OnDestroy {

 @ViewChild(MatSort) sort!: MatSort;

 filterForm: FormGroup = inject(FormBuilder).group({
  search: [''],
  statusPending: [false],
  statusInProgress: [false],
  statusCompleted: [false],
  productLine: [''],
  startDate: [''],
  endDate: ['']
 });

 productLines = ['Ready-Mix', 'Cement', 'Aggregates'];
 displayedColumns: string[] = ['status', 'orderNumber', 'productLine', 'product', 'quantity', 'dateRequested'];
 orders: Order[] = mockOrders;

 dataSource: MatTableDataSource<Order> = new MatTableDataSource(this.orders);

 isMobile = false;

 private destroyed$ = new Subject<void>();
 private ch = inject(ChangeDetectorRef);

 ngOnInit() {
  this.filterForm.valueChanges
    .pipe(takeUntil(this.destroyed$))
    .subscribe(values => {
     this.filterTable(values);
     this.ch.markForCheck();
     this.ch.detectChanges();
    });

  this.checkIfMobile();
  window.addEventListener('resize', this.checkIfMobile.bind(this));
 }

 ngAfterViewInit() {
  this.dataSource.sort = this.sort;
 }

 ngOnDestroy() {
  this.destroyed$.next();
  window.removeEventListener('resize', this.checkIfMobile.bind(this));
 }

 checkIfMobile() {
  this.isMobile = window.innerWidth <= 768;
  this.ch.markForCheck();
 }

 filterTable(values: any) {
  let {search, statusPending, statusInProgress, statusCompleted, productLine, startDate, endDate} = values;

  let statuses = [];
  if (statusPending) statuses.push('Pending');
  if (statusInProgress) statuses.push('In Progress');
  if (statusCompleted) statuses.push('Completed');

  if (endDate) {
   // make TO search inclusive
   endDate = new Date(endDate);
   endDate.setHours(23, 59, 59, 999);
  }
  this.dataSource.data = this.orders.filter(order => {
   const matchesSearch = order.orderNumber.toLowerCase().startsWith(search.toLowerCase());
   const matchesStatus = !statuses.length || statuses.includes(order.status);
   const matchesProductLine = !productLine || order.productLine === productLine;
   const matchesStartDate = !startDate || new Date(order.dateRequested) >= new Date(startDate);
   const matchesEndDate = !endDate || new Date(order.dateRequested) <= new Date(endDate);

   return matchesSearch && matchesStatus && matchesProductLine && matchesStartDate && matchesEndDate;
  });
 }

 getStatusClass(status: string): string {
  switch (status) {
   case 'Pending':
    return 'status-pending';
   case 'In Progress':
    return 'status-in-progress';
   case 'Completed':
    return 'status-completed';
   default:
    return '';
  }
 }
}

