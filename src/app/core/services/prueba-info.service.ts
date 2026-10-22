import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PruebaInfoService {
  // Inicia en true para que se abra apenas entren al sitio
  readonly isModalVisible = signal<boolean>(true);

  open(): void {
    this.isModalVisible.set(true);
  }

  close(): void {
    this.isModalVisible.set(false);
  }

  toggle(): void {
    this.isModalVisible.update(v => !v);
  }
}
