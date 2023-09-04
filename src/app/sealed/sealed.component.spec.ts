import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SealedComponent } from './sealed.component';

describe('SealedComponent', () => {
  let component: SealedComponent;
  let fixture: ComponentFixture<SealedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SealedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SealedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
