import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobberQualityComponent } from './jobber-quality.component';

describe('JobberQualityComponent', () => {
  let component: JobberQualityComponent;
  let fixture: ComponentFixture<JobberQualityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobberQualityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobberQualityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
