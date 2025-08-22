import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { WebSocketService } from '@services/web-socket.service';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '@utils/svg.component';
import { ChatsService } from '@features/chats/data/chats.service';
import { AudioMessageComponent } from '../audio-message/audio-message.component';

@Component({
  selector: 'app-input-field',
  imports: [CommonModule, SvgIconComponent, AudioMessageComponent],
  templateUrl: './input-field.component.html',
  styleUrl: './input-field.component.css',
})
export class InputFieldComponent {
  URL = URL;
  webSocketService = inject(WebSocketService);
  chatsService = inject(ChatsService);

  public repliedOn: any = null;
  public editMode = false;
  public messageIdForEdit: string | null = null;
  public messageTextForEdit: string | null = null;

  isVoice = true;
  isRecording = false;

  public value: string = '';

  public filesList: { name: string; size: number; file: File }[] = [];

  @Input() chatData: any;
  @Output() sendMessage = new EventEmitter();
  @Output() replyOn = new EventEmitter<string>();
  @Output() toggleRecVideoMsg = new EventEmitter();

  @ViewChild('input') inputField?: any;
  @ViewChild(AudioMessageComponent) audio_msg!: AudioMessageComponent;

  toggleEditMessage(msgId: string) {
    if (this.messageIdForEdit === msgId) {
      this.messageIdForEdit = null;
      this.editMode = false;
      this.messageTextForEdit = null;
    } else {
      this.messageIdForEdit = msgId;
      this.editMode = true;
      this.messageTextForEdit = this.chatData?.messages.find(
        (msg: any) => msg.id === msgId
      ).text;
    }
  }
  editMessage() {
    const text = this.value;
    if (text.length == 0) {
      this.toggleEditMessage(this.messageIdForEdit!);
    }
    this.chatsService.editMsg(this.messageIdForEdit!, text, () => {
      const msg = this.chatData.messages.find(
        (msg: any) => msg.id === this.messageIdForEdit
      );
      if (msg) {
        msg.text = text;
        msg.editedAt = new Date().toISOString();
      }
      this.toggleEditMessage(this.messageIdForEdit!);
    });
  }
  onKeyPress(event: any): void {
    this.value = event.currentTarget.value;
    
    event.currentTarget.style.height = 'auto'; // reset to shrink if needed
    event.currentTarget.style.height = event.currentTarget.scrollHeight + 'px'; // set height to content


    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (this.editMode) {
        this.editMessage();
      } else {
        this.sendMessage.emit();
      }
    }
  }

  pressTimer: any;
  pressDuration = 500;
  wasLongPress = false;
  onPressStart(event: Event, type: string): void {
    this.wasLongPress = false;
    event.preventDefault();
    event.stopPropagation();

    this.pressTimer = setTimeout(() => {
      this.wasLongPress = true;
      this.isRecording = true;

      if (type == 'video') this.toggleRecVideoMsg.emit();
      else {
        this.audio_msg?.startRecording();
      }
    }, this.pressDuration);
  }
  onPressEnd(type: string): void {
    clearTimeout(this.pressTimer);
    if (this.wasLongPress) {
      if (type == 'video') this.toggleRecVideoMsg.emit();
      else this.audio_msg?.endRecording();
      this.isRecording = false;
    } else {
      this.switchVideo2Voice();
    }
  }
  handleAudio(blob: Blob) {
    this.chatsService.sendAudioMessage(this.chatData.chat.id, blob);
  }
  switchVideo2Voice() {
    this.isVoice = !this.isVoice;
  }
  stopPropagation($event: Event) {
    $event.stopPropagation();
  }
  deleteFile(file: any): void {
    this.filesList = this.filesList.filter((f) => f !== file);
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      let newFiles = files.map((file) => ({
        name: file.name,
        size: file.size,
        file: file,
      }));
      this.filesList.push(...newFiles);
      this.filesList = this.filesList.slice(0, 10); // Limit to 10 files
    }
  }
  public clearInputField() {
    this.value = '';
    if (this.inputField) this.inputField.nativeElement!.value = '';
  }
}
