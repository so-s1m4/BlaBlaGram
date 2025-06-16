import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginPage {
  router = inject(Router);
  authService = inject(AuthService);


  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.minLength(3)]),
    password: new FormControl('', [Validators.required])
  });

  ngOnInit() {
    if (this.authService.getIsAuthed() == null) {
      this.authService.onInit();
    }
    if (this.authService.getIsAuthed()) {
      this.router.navigate(['']);
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();

    this.authService.login(
      this.form.value as { email: string; password: string }
    )
    
    this.router.navigate(['']);
  }
}
