import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal-header',
  templateUrl: './modal-header.component.html',
  styleUrls: ['./modal-header.component.css']
})
export class ModalHeaderComponent {

  @Input() titulo!: any;
  @Output() dismiss: EventEmitter<void> = new EventEmitter<void>();
  constructor() { }
  ngOnInit(): void {
  }
  dismissEvent(): void {
    this.dismiss.emit();
  }
}
