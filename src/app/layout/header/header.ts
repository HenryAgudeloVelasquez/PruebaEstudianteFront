import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PruebaInfoService } from '../../core/services/prueba-info.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  private readonly pruebaInfoService = inject(PruebaInfoService);
  readonly isMobileMenuOpen = signal<boolean>(false);

  readonly navItems = [
    { label: 'Estudiantes', icon: 'pi pi-users', route: '/estudiantes' },
    { label: 'Inscripción de Materias', icon: 'pi pi-book', route: '/inscripciones' },
    { label: 'Compañeros de Clase', icon: 'pi pi-id-card', route: '/companeros' },
    { label: 'Catálogo Académico', icon: 'pi pi-sitemap', route: '/catalogo' },
  ];

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  openPruebaModal(): void {
    this.pruebaInfoService.open();
    this.closeMobileMenu();
  }
}
