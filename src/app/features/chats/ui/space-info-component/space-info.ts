import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Renderer2,
  Input,
} from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ImgPipe } from '@utils/img.pipe';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { SvgIconComponent } from '@utils/svg.component';
import { PhotoGalleryComponent } from './ui/photo-gallery/photo-gallery.component';
import { Subject, takeUntil } from 'rxjs';
import { AppComponent } from 'app/app.component';
import { ChatsService } from '@features/chats/data/chats.service';

@Component({
  selector: 'app-space-info',
  imports: [
    CommonModule,
    ImgPipe,
    ReactiveFormsModule,
    SvgIconComponent,
    PhotoGalleryComponent,
  ],
  templateUrl: './space-info.html',
  styleUrl: './space-info.css',
})
export class SpaceInfoComponent implements OnInit, OnDestroy {
  @Input() id: string = '';
  private readonly chatsService = inject(ChatsService);

  selectedNav: 'Media' | 'Members' | 'Files' | 'Voice' | 'Settings' = 'Members';
  navPanel: { label: string; guard: boolean }[] = [];

  data: any = undefined;

  changeTo(page: string) {
    // narrow to allowed tabs only
    if (['Media', 'Members', 'Files', 'Voice', 'Settings'].includes(page)) {
      this.selectedNav = page as typeof this.selectedNav;
    }
  }
  private buildNavPanel() {
    this.navPanel = [
      { label: 'Media', guard: true },
      { label: 'Members', guard: true },
      { label: 'Files', guard: true },
      { label: 'Voice', guard: true },
      { label: 'Settings', guard: true },
    ];
  }

  ngOnInit(): void {
    this.chatsService.getInfoAboutChat(this.id, (data: any) => {
      this.data = data;
      console.log(data)
    });

    this.buildNavPanel()
  }
  ngOnDestroy(): void {}
}
