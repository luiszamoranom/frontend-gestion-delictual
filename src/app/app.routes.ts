import { Routes } from '@angular/router';
import {ListaDelincuentesComponent} from "./pages/lista-delincuentes/lista-delincuentes.component";
import {AlertasComponent} from "./pages/alertas/alertas.component";

export const routes: Routes = [
  {path: "", component: ListaDelincuentesComponent},
  {path: "alertas", component: AlertasComponent},
  {path: "**", component: ListaDelincuentesComponent}
];
