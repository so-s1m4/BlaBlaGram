import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gifts } from './gifts';

describe('Gifts', () => {
  let component: Gifts;
  let fixture: ComponentFixture<Gifts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gifts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Gifts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
