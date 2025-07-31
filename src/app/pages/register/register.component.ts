import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterPage {
  router = inject(Router);
  authService = inject(AuthService);


  form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
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

    this.authService.register(
      this.form.value as { username: string; password: string; name: string }
    ).then((isAuthed: any) => {
      if (isAuthed) {
        this.router.navigate(['']);
      } else {
        alert('The username is already busy');
      }
    });
  }
}
