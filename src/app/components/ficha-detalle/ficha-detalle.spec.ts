import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FichaDetalle } from './ficha-detalle';

describe('FichaDetalle', () => {
  let component: FichaDetalle;
  let fixture: ComponentFixture<FichaDetalle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FichaDetalle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FichaDetalle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
