import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-modal-footer',
  templateUrl: './modal-footer.component.html',
  styleUrls: ['./modal-footer.component.css']
})
export class ModalFooterComponent {


  @Output() agregar: EventEmitter<void> = new EventEmitter<void>();
  @Output() close: EventEmitter<boolean> = new EventEmitter<boolean>();
  constructor() { }

  ngOnInit(): void {
  }
  agregarEvent(): void {
    this.agregar.emit();
  }
  closeEvent(conf: boolean): void {
    this.close.emit(conf);
  }
}
