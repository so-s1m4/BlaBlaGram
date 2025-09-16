import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { GlassEffectDirective } from "@shared/common-ui/glass-wrapper-component/glass-wrapper-component";

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, GlassEffectDirective],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginPage {
  router = inject(Router);
  authService = inject(AuthService);

  form = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
    ]),
    password: new FormControl('', [Validators.required]),
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

    this.authService
      .login(this.form.value as { username: string; password: string })
      .then((isAuthed) => {
        if (isAuthed) {
          this.router.navigate(['']);
        } else {
          alert('Invalid username or password');
        }
      });
  }
}
