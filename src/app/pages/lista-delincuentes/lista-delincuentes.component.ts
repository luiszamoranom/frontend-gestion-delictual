import { Component } from '@angular/core';
import {FirebaseService} from "../../services/firebase.service";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-lista-delincuentes',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './lista-delincuentes.component.html',
  styleUrl: './lista-delincuentes.component.css'
})
export class ListaDelincuentesComponent {
  carpetas: { nombre: string, images: any[] }[] = [];
  nuevaCarpetaNombre: string = '';

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    this.listarCarpetas();

    this.firebaseService.evento_imagenes_actualizadas.subscribe(() => {
      this.carpetas = []
      this.listarCarpetas();
    });
  }

  async listarCarpetas() {
    const nombresCarpetas = await this.firebaseService.listarCarpetas();
    for (const carpeta of nombresCarpetas) {
      const imagenes = await this.firebaseService.listarImagenesEnCarpeta(carpeta);
      this.carpetas.push({ nombre: carpeta, images: imagenes });
    }
  }

  onFileSelected(event: any, carpeta: string) {
    const files: File[] = event.target.files;
    if (files.length > 0) {
      this.firebaseService.subirImagenes(carpeta, files);
    }
  }

  async agregarCarpeta() {
    if (this.nuevaCarpetaNombre.trim() !== '') {
      await this.firebaseService.crearCarpeta(this.nuevaCarpetaNombre);
      this.nuevaCarpetaNombre = ''; // Limpiar el input después de agregar la carpeta
    } else {
      console.log('Ingrese un nombre para la carpeta');
    }
  }

}
