import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatsService } from '@features/chats/data/chats.service';
import { FriendsService } from '@features/friends/data/friends.service';
import { ImgPipe } from '@shared/utils/img.pipe';
import { SvgIconComponent } from '@shared/utils/svg.component';

@Component({
  selector: 'app-create-component',
  imports: [SvgIconComponent, CommonModule, ImgPipe, ReactiveFormsModule],
  templateUrl: './create-component.html',
  styleUrl: './create-component.css',
})
export class CreateComponent implements OnInit {
  @ViewChild('label') label: any;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly friendsService = inject(FriendsService);
  private readonly chatsService = inject(ChatsService);
  private readonly renderer = inject(Renderer2);

  friends$ = this.friendsService.friends;

  type: string = '';

  AVAILABLE_TYPES = ['group', 'channel'];

  selected: { id: string; username: string; img: any }[] = [];
  searchValue: string = '';

  values = new FormGroup({
    img: new FormControl<File | null>(null),
    title: new FormControl<string | null>(null, [Validators.required]),
    description: new FormControl<string | null>(null),
  });

  step: number = 0;

  toggleSelect(friend: any) {
    const found = this.selected.find((item) => item.id == friend.id);
    if (found) {
      this.selected.splice(this.selected.indexOf(found), 1);
      return;
    } else {
      this.selected.push({
        id: friend.id,
        img: friend.img[friend.img.length - 1],
        username: friend.username,
      });
    }
  }
  onInput(event: Event) {
    this.searchValue = (event.currentTarget as HTMLInputElement).value.trim();
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;

    console.log(file);
    if (!file) {
      if (this.label?.nativeElement) {
        this.renderer.setStyle(
          this.label.nativeElement,
          'backgroundImage',
          'none'
        );
      }
      return;
    }

    const blobUrl = URL.createObjectURL(file);
    if (this.label?.nativeElement) {
      this.renderer.setStyle(
        this.label.nativeElement,
        'backgroundImage',
        `url(${blobUrl})`
      );
      this.renderer.setStyle(
        this.label.nativeElement,
        'backgroundSize',
        'cover'
      );
      this.renderer.setStyle(
        this.label.nativeElement,
        'backgroundPosition',
        'center'
      );
    }
    this.values.patchValue({ img: file });
  }
  goBack() {
    this.step--;
    if (this.step < 0 || this.type == 'channel') {
      this.router.navigate(['chats']);
    }
  }
  goForward() {
    this.step++;
    if (this.step == 2) {
      this.create();
    }
  }
  create() {
    if (this.values.invalid) {
      this.step = 1;
      return;
    }
    this.router.navigate(["chats"])
    this.chatsService.createSpace(
      this.type,
      {
        ...this.values.getRawValue(),
        selected: this.selected,
      }
    );
  }
  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const type = params.get('type') as string;
      if (!this.AVAILABLE_TYPES.includes(type)) this.router.navigate(['chats']);
      this.type = type;
      if (type == 'channel') {
        this.step = 1;
      }
    });
  }
  get friends() {
    return this.friends$.list.filter((item) =>
      item.username
        .toLocaleLowerCase()
        .includes(this.searchValue.toLocaleLowerCase())
    );
  }
  isChecked(user: any) {
    return this.selected.find((item) => item.id == user.id);
  }
}
