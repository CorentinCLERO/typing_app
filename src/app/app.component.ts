import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})

export class AppComponent {
  phrase: string[] = 'Je vais'.split('');
  key: string = '';
  currentIndex: number = 0;
  typedCharacters: { char: string, isCorrect: boolean }[] = [];

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    event.preventDefault()
    if (this.currentIndex < this.phrase.length) {
      if (!["Shift", "AltGraph", "Control", "Alt"].includes(event.key)) {
        this.key = event.key;
        const isCorrect = this.key === this.phrase[this.currentIndex];
        
        // Stocker le caractère tapé et sa validité
        this.typedCharacters[this.currentIndex] = {
          char: this.key,
          isCorrect: isCorrect
        };
  
        // Avancer à la prochaine lettre seulement si la frappe est correcte
        if (isCorrect) {
          if (this.currentIndex === this.phrase.length - 1) {
            this.currentIndex = 0
            this.typedCharacters = []
            this.key = ''
          } else {
            this.currentIndex++;
          }
        }
      }
    }
  }
}