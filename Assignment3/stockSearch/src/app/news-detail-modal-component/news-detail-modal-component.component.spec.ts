import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsDetailModalComponentComponent } from './news-detail-modal-component.component';

describe('NewsDetailModalComponentComponent', () => {
  let component: NewsDetailModalComponentComponent;
  let fixture: ComponentFixture<NewsDetailModalComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsDetailModalComponentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewsDetailModalComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
