import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-info-table',
  imports: [],
  templateUrl: './info-table.component.html',
  styleUrl: './info-table.component.css'
})
export class InfoTableComponent implements OnInit{
  orders=[
    {date:'may 20th 2025', orderId:10, customer:'Customer'},
    {date:'apr 20th 2025', orderId:11, customer:'Customer'},
    {date:'jun 20th 2025', orderId:12, customer:'Customer'}
  ]
ngOnInit(): void {
  // throw new Error('Method not implemented.');
}
constructor(){}
}
