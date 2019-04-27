import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeckSearchComponent } from './deck-search.component';

describe('DeckSearchComponent', () => {
  let component: DeckSearchComponent;
  let fixture: ComponentFixture<DeckSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeckSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeckSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
