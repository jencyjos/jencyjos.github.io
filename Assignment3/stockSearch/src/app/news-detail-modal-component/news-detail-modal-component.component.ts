import { MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';

@Component({
  selector: 'app-news-detail-modal-component',
  templateUrl: './news-detail-modal-component.component.html',
  styleUrls: ['./news-detail-modal-component.component.css']
})

export class NewsDetailModalComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<NewsDetailModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any // Inject data passed to dialog
  ) {}
  ngOnInit() {
    const matDialogConfig = new MatDialogConfig()


    matDialogConfig.position = { top: `36px` }
    this.dialogRef.updatePosition(matDialogConfig.position)
  }

  onClose(): void {
    this.dialogRef.close();
  }

}


