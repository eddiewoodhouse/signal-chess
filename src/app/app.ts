import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChessBoardComponent } from './features/chess-game/components/chess-board/chess-board.component';
import { GameStatusComponent } from './features/chess-game/components/game-status/game-status.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ChessBoardComponent, GameStatusComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'signal-chess';
}
