import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Emojis } from './emojis';

describe('Emojis', () => {
  let component: Emojis;
  let fixture: ComponentFixture<Emojis>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Emojis]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Emojis);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
