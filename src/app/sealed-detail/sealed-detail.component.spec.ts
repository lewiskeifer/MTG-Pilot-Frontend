import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SealedDetailComponent } from './sealed-detail.component';

describe('SealedDetailComponent', () => {
  let component: SealedDetailComponent;
  let fixture: ComponentFixture<SealedDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SealedDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SealedDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
