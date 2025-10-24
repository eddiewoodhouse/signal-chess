import { Component, inject, input, signal } from '@angular/core';
import { PieceColor } from '../../../../shared/types/chess.types';
import { ChessGameService } from '../../../../core/services/chess-game.service';
import { CapturedPiecesComponent } from '../captured-pieces/captured-pieces.component';

@Component({
  selector: 'app-checkmate-modal',
  templateUrl: './checkmate-modal.component.html',
  styleUrls: ['./checkmate-modal.component.scss'],
})
export class CheckmateModalComponent {
  gameResolution = input<String>('Game over!');
  chessGameService = inject(ChessGameService);
  isVisible = signal(false);
  winner = signal<PieceColor | null>(null);

  retry(): void {
    this.chessGameService.resetGame();
  }
}
