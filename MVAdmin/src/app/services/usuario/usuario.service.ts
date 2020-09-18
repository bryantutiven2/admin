import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'

import URL_SERVICIOS from 'src/app/config/config';
import { Router } from '@angular/router';
import { Usuario } from '../../models/usuario.model';
import { map } from "rxjs/operators";
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private httpOptions: any;
  
  public token: string;
  public refresh: string;
  public user: string;
  public token_expires: Date;
  public username: string;
  public errors: any = [];
  public isLoggedin = false;

  constructor(
    public http: HttpClient,
    public router: Router
  ) {
    this.loadStorage();
    this.httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    
  }

  public loginUser(user) {
    localStorage.setItem('username', user['email']);
    let url = URL_SERVICIOS.login;
    return this.http.post(url, JSON.stringify(user), this.httpOptions)
      .pipe(map((resp: any) => {
        console.log(resp);
        this.isLoggedin = true;

        this.token = JSON.stringify(resp['access']);
        this.refresh = JSON.stringify(resp['refresh']).slice(1,-1);
        this.updateData(resp['access'])
        localStorage.setItem('token', this.token);
        localStorage.setItem('refresh', this.refresh);
        localStorage.setItem('id', JSON.stringify(this.tokenGestion(resp['access'])));
        localStorage.setItem('user', JSON.stringify(this.tokenGestion(resp['access'])));
        return true
      }));
  }

  islogIn() {
    return ((this.token.length > 5)) ? true : false;
  }

  loadStorage() {
    if (localStorage.getItem('token') && localStorage.getItem('refresh')) {
      this.token = localStorage.getItem('token');
      this.user = JSON.parse(localStorage.getItem('user'));
      this.refreshToken()
    } else {
      this.token = '';
      this.user = null;
    }
  }

  tokenGestion(token) {
    const token_parts = token.split(/\./);
    const token_decoded = JSON.parse(window.atob(token_parts[1]));
    return token_decoded;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  public refreshToken() {
    let url = URL_SERVICIOS.refreshlogin;
    this.http.post(url, { "refresh" : localStorage.getItem('refresh')}, this.httpOptions).subscribe(
      data => {
        localStorage.setItem('token', data['access']);
        localStorage.setItem('id', JSON.stringify(this.tokenGestion(data['access'])));
        localStorage.setItem('user', JSON.stringify(this.tokenGestion(data['access'])));
        this.updateData(data['access']);
      },
      err => {
        this.errors = err['error'];
      }
    );
  }

  public logoutUser() {
    this.token = '';
    this.token_expires = null;
    this.username = null;
    localStorage.removeItem('token');
    localStorage.removeItem('FBtoken');
    localStorage.removeItem('user');
    localStorage.removeItem('username');
    localStorage.removeItem('id');
    localStorage.removeItem('tipo_user'); 
    localStorage.removeItem('refresh'); 
    this.isLoggedin = true;
    this.router.navigate(['/login'])
  }

  private updateData(token) {
    this.token = token;
    this.errors = [];

    const token_parts = this.token.split(/\./);
    const token_decoded = JSON.parse(window.atob(token_parts[1]));
    this.token_expires = new Date(token_decoded.exp * 1000);
    this.username = token_decoded.username;
  }


  getUserId(id) {
    let url = URL_SERVICIOS.usuario + id
    let httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.getToken(),
      })
    }

    return this.http.get(url, httpOptions);
  }

  getDatosUser(email) {
    let url = URL_SERVICIOS.datosUsuario + email + '/'
    let httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.getToken(),
      })
    }

    return this.http.get(url, httpOptions);
  }

  crearUsuario(usuario) {
    let url = URL_SERVICIOS.usuario;
    let httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': "*",
      })
    }
    return this.http.post(url, usuario, httpOptions);
  }

  getUsers(id) {
    let url = URL_SERVICIOS.usuarios_camp + id + '/';
    let httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.getToken(),
      })
    }
    return this.http.get(url, httpOptions);
  }

  isAuthenticated(){
    console.log(this.token_expires)
    return this.getToken();
  };
}
