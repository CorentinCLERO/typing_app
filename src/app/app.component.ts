import { Component, HostListener, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface LLMResponse {
  response: string
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})

@Injectable({ providedIn: 'root' })
export class AppComponent {
  phrase: string = 'Je vais pas pouvoir venir ce samedi';
  phraseArray: string[] = this.phrase.split('');
  key: string = '';
  currentIndex: number = 0;
  typedCharacters: { char: string, isCorrect: boolean, haveBeenMistype: boolean }[] = [];
  mistypedCharacters: { [index: number]: string } = {};
  startTime: Date = new Date();
  wordsPerMinute: number = 0;
  haveBeenMistype: boolean = false;
  accuracy: number = -1;
  isLLMInfosFetching: boolean = true;
  volume: number = 1.0;

  constructor(private http: HttpClient) {
    this.fetchPhrase();
  }
  
  fetchPhrase() {
    this.http.post<LLMResponse>('http://localhost:11434/api/generate', {
      model: "llama3",
      prompt: "Make me a French phrase of 20 words (just send me the phrase without anything else)?",
      stream: false
    }).subscribe(res => {
      this.phraseArray = res.response.split('');
      this.isLLMInfosFetching = false
      console.log("réponse de l'api : ", res.response);
    });
  }

  playSound(type: 'correct' | 'incorrect') {
    const audio = new Audio();
    audio.src = type === 'correct' ? 'assets/audio/correct.mp3' : 'assets/audio/incorrect.mp3';
    audio.volume = this.volume;
    audio.load();
    audio.play();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    event.preventDefault();
    console.log(event.key, event.code, event);
    if (this.currentIndex < this.phraseArray.length) {
      if (!["Shift", "AltGraph", "Control", "Alt"].includes(event.key)) {
        this.key = event.key;
        const isCorrect: boolean = this.key === this.phraseArray[this.currentIndex];

        // Stocker le caractère tapé et sa validité
        this.typedCharacters[this.currentIndex] = {
          char: this.key,
          isCorrect: isCorrect,
          haveBeenMistype: this.haveBeenMistype
        };

        // Avancer à la prochaine lettre seulement si la frappe est correcte
        if (isCorrect) {
          if (this.currentIndex === 0) {
            this.startTime = new Date();
          }
          if (this.currentIndex === this.phraseArray.length - 1) {
            const endTime = new Date();
            const timeDiff = (endTime.getTime() - this.startTime.getTime()) / 60000; // Convert milliseconds to minutes
            const nonSpaceCharacters = this.phraseArray.filter(char => char !== ' ').length;
            this.wordsPerMinute = nonSpaceCharacters / (5 * timeDiff);
            const totalTypedCharacters = this.phraseArray.length;
            const correctCharacters = totalTypedCharacters - Object.keys(this.mistypedCharacters).length;
            this.accuracy = (correctCharacters / totalTypedCharacters) * 100;
            this.currentIndex = 0;
            this.typedCharacters = [];
            this.key = '';
            this.mistypedCharacters = {};
            this.haveBeenMistype = false;
            this.isLLMInfosFetching = true;
            this.fetchPhrase();
          } else {
            this.currentIndex++;
          }
          this.haveBeenMistype = false;
          this.playSound('correct');
        } else {
          this.haveBeenMistype = true;
          this.mistypedCharacters[this.currentIndex] = this.key;
          this.playSound('incorrect');
        }
      }
    }
  }
}