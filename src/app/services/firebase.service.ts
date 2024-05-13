import { Injectable, EventEmitter} from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, listAll, deleteObject, uploadString, getMetadata, getDownloadURL, StorageReference, uploadBytes } from 'firebase/storage';
import { getDatabase, ref as databaseRef, onValue, DataSnapshot } from 'firebase/database';
import {Mensaje} from "../interfaces/Mensaje";

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  private imagesBucket;
  private database;
  imagesUpdated: EventEmitter<void> = new EventEmitter<void>();
  messagesUpdated: EventEmitter<any[]> = new EventEmitter<any[]>();

  constructor() {
    const firebaseConfig = {
      apiKey: "AIzaSyCGaX3UQ4-87HkonrTYP-e97-hmUU4IYyw",
      authDomain: "gestiondelictual.firebaseapp.com",
      projectId: "gestiondelictual",
      storageBucket: "gestiondelictual.appspot.com",
      messagingSenderId: "851176949624",
      appId: "1:851176949624:web:4c4e7c339a3c8019d3ea8d"
    };
    const app = initializeApp(firebaseConfig);
    this.imagesBucket = getStorage(app);
    this.database = getDatabase(app);
  }

  async listarCarpetas(): Promise<string[]> {
    const storageRef = ref(this.imagesBucket);
    try {
      const result = await listAll(storageRef);
      const folderNames = result.prefixes.map(folderRef => folderRef.name);
      return folderNames;
    } catch (error) {
      console.error("Error al listar carpetas:", error);
      return [];
    }
  }

  async crearCarpeta(nombreCarpeta: string): Promise<void> {
    const archivoVacio = '';
    const rutaArchivo = nombreCarpeta + '/.keep';
    const archivoRef = ref(this.imagesBucket, rutaArchivo);

    try {
      await uploadString(archivoRef, archivoVacio);
      console.log("Carpeta creada exitosamente:", nombreCarpeta);
      this.imagesUpdated.emit();
    } catch (error) {
      console.error("Error al crear la carpeta:", error);
    }
  }

  async eliminarCarpeta(nombreCarpeta: string): Promise<void> {
    const carpetaRef = ref(this.imagesBucket, nombreCarpeta);
    const carpetaRefDir = ref(this.imagesBucket, nombreCarpeta + '/.keep');
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

  async listImagesInFolder(folderPath: string): Promise<any[]> {

    try {
      const folderRef = ref(this.imagesBucket, folderPath);
      const listResult = await listAll(folderRef);

      const imageInfoList = [];
      for (const itemRef of listResult.items) {
        const metadata = await getMetadata(itemRef);
        const imageUrl = await getDownloadURL(itemRef);

        imageInfoList.push({
          name: itemRef.name,
          size: metadata.size,
          contentType: metadata.contentType,
          downloadURL: imageUrl
        });
      }

      return imageInfoList;
    } catch (error) {
      console.error("Error listing images:", error);
      return [];
    }

  }

  async subirImagen(carpeta: string, archivo: File): Promise<void> {
    const rutaArchivo = carpeta + '/' + archivo.name;
    const archivoRef = ref(this.imagesBucket, rutaArchivo);

    try {
      await uploadBytes(archivoRef, archivo);
      console.log("Imagen subida exitosamente:", archivo.name);
      this.imagesUpdated.emit();
    } catch (error) {
      console.error("Error al subir la imagen:", error);
    }
  }

  obtenerMensajesEnTiempoReal(): void {
    const mensajesRef = databaseRef(this.database, );
    onValue(mensajesRef, (snapshot) => {
      const mensajes: Mensaje[] = [];
      snapshot.forEach((childSnapshot: DataSnapshot) => {
        const mensaje = childSnapshot.val();
        mensajes.push(mensaje);
      });
      // Emitir eventos de actualización de mensajes
      this.messagesUpdated.emit(mensajes);
    });
  }
}
