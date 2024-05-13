import {Component, inject} from '@angular/core';
import {FirebaseService} from "../../services/firebase.service";
import {Mensaje} from "../../interfaces/Mensaje";

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [],
  templateUrl: './alertas.component.html',
  styleUrl: './alertas.component.css'
})
export class AlertasComponent {
  protected firebaseService = inject(FirebaseService)
  messages: Mensaje[] = [];

  constructor() { }

  ngOnInit(): void {
    // Llama al método para obtener mensajes en tiempo real desde Firebase Realtime Database
    this.firebaseService.obtenerMensajesEnTiempoReal();

    // Escucha los cambios en los mensajes y actualiza la lista de mensajes
    this.firebaseService.messagesUpdated.subscribe((messages: Mensaje[]) => {
      this.messages = messages;
    });
  }
}
