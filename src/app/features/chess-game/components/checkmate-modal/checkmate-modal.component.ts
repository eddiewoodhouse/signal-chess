import { Component, inject, Signal, signal } from '@angular/core';
import {
  Piece,
  PieceColor,
  PieceType,
} from '../../../../shared/types/chess.types';
import { ChessGameService } from '../../../../core/services/chess-game.service';

@Component({
  selector: 'app-checkmate-modal',
  templateUrl: './checkmate-modal.component.html',
  styleUrls: ['./checkmate-modal.component.scss'],
})
export class CheckmateModalComponent {
  chessGameService = inject(ChessGameService);
  isVisible = signal(false);
  winner = signal<PieceColor | null>(null);

  retry(): void {
    console.log('Retrying game...');
  }
}
