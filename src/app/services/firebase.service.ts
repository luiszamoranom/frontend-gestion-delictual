import { Injectable, EventEmitter} from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, listAll, deleteObject, uploadString, getMetadata, getDownloadURL, StorageReference, uploadBytes } from 'firebase/storage';
import { getDatabase, ref as databaseRef, onValue, DataSnapshot } from 'firebase/database';
import {Mensaje} from "../interfaces/Mensaje";

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  private bucket_de_imagenes;
  private base_de_datos;
  evento_imagenes_actualizadas: EventEmitter<void> = new EventEmitter<void>();
  evento_mensajes_actualizados: EventEmitter<any[]> = new EventEmitter<any[]>();

  constructor() {
    // configuración, con las keys, para acceder a mi cuenta de firebase
    const configuracion_firebase = {
      apiKey: "AIzaSyCGaX3UQ4-87HkonrTYP-e97-hmUU4IYyw",
      authDomain: "gestiondelictual.firebaseapp.com",
      projectId: "gestiondelictual",
      storageBucket: "gestiondelictual.appspot.com",
      messagingSenderId: "851176949624",
      appId: "1:851176949624:web:4c4e7c339a3c8019d3ea8d"
    };
    const app = initializeApp(configuracion_firebase);
    this.bucket_de_imagenes = getStorage(app);
    this.base_de_datos = getDatabase(app);
  }

  async listarCarpetas(): Promise<string[]> {
    const referencia_storage = ref(this.bucket_de_imagenes);
    try {
      const lista_de_carpetas = await listAll(referencia_storage);
      const nombre_de_carpetas = lista_de_carpetas.prefixes.map(it => it.name);
      return nombre_de_carpetas;
    } catch (error) {
      console.error("Error al listar carpetas:", error);
      return [];
    }
  }

  async crearCarpeta(nombreCarpeta: string): Promise<void> {
    const archivoVacio = '';
    const rutaArchivo = nombreCarpeta + '/.keep';
    const archivoRef = ref(this.bucket_de_imagenes, rutaArchivo);

    try {
      await uploadString(archivoRef, archivoVacio);
      console.log("Carpeta creada exitosamente:", nombreCarpeta);
      this.evento_imagenes_actualizadas.emit();
    } catch (error) {
      console.error("Error al crear la carpeta:", error);
    }
  }


  async eliminarCarpeta(nombreCarpeta: string): Promise<void> {
    const carpetaRef = ref(this.bucket_de_imagenes, nombreCarpeta);
    const carpetaRefDir = ref(this.bucket_de_imagenes, nombreCarpeta + '/.keep');
    await this.eliminarCarpetaRecursiva(carpetaRef);
    await deleteObject(carpetaRefDir);
  }

  private async eliminarCarpetaRecursiva(carpetaRef: StorageReference): Promise<void> {
    try {
      const files = await listAll(carpetaRef);
      const deletePromises = files.items.map(async (item) => {
        await deleteObject(item);
      });
      await Promise.all(deletePromises);
      console.log("Carpeta eliminada exitosamente:", carpetaRef.name);
    } catch (error) {
      console.error("Error al eliminar la carpeta:", error);
    }
  }

  async listarImagenesEnCarpeta(path: string): Promise<any[]> {
    // dato el path, se accede a la información de cada imagen. Esta será utilizada
    // para mostrar cada imagen de cada delincuente en la vista del front
    try {
      const referencia_carpeta = ref(this.bucket_de_imagenes, path);
      const lista_de_imagenes = await listAll(referencia_carpeta);

      const informacion_lista_imagenes = [];
      for (const ref_imagen of lista_de_imagenes.items) {
        const metadata = await getMetadata(ref_imagen);
        const url = await getDownloadURL(ref_imagen);

        informacion_lista_imagenes.push({
          name: ref_imagen.name,
          size: metadata.size,
          contentType: metadata.contentType,
          downloadURL: url
        });
      }

      return informacion_lista_imagenes;
    } catch (error) {
      console.error("Error al listar imagenes de carpeta:", error);
      return [];
    }
  }


  async subirImagenes(carpeta: string, archivos: File[]): Promise<void> {
    for (const archivo of archivos) {
      const rutaArchivo = carpeta + '/' + archivo.name;
      const archivoRef = ref(this.bucket_de_imagenes, rutaArchivo);

      try {
        await uploadBytes(archivoRef, archivo);
        console.log("Imagen subida exitosamente:", archivo.name);
      } catch (error) {
        console.error("Error al subir la imagen:", error);
      }
    }
    this.evento_imagenes_actualizadas.emit();
  }

  obtenerMensajesEnTiempoReal(): void {
    const mensajesRef = databaseRef(this.base_de_datos);
    onValue(mensajesRef, (snapshot) => {
      const mensajes: Mensaje[] = [];
      snapshot.forEach((childSnapshot: DataSnapshot) => {
        const mensaje = childSnapshot.val();
        mensajes.push(mensaje);
      });
      // Emitir eventos de actualización de mensajes, para actualizar el componente
      this.evento_mensajes_actualizados.emit(mensajes);
    });
  }
}
