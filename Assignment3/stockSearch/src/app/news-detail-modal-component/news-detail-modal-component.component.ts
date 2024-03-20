import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';

@Component({
  selector: 'app-news-detail-modal-component',
  templateUrl: './news-detail-modal-component.component.html',
  styleUrls: ['./news-detail-modal-component.component.css']
})

export class NewsDetailModalComponent {
  constructor(
    public dialogRef: MatDialogRef<NewsDetailModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any // Inject data passed to dialog
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

}


