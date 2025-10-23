import { Component, Signal, signal } from '@angular/core';
import { Piece, PieceColor } from '../../../../shared/types/chess.types';

@Component({
  selector: 'app-checkmate-modal',
  templateUrl: './checkmate-modal.component.html',
  styleUrls: ['./checkmate-modal.component.scss'],
})
export class CheckmateModalComponent {
  isVisible = signal(false);
  winner = signal<PieceColor | null>(null);
  capturedPieces = signal<{ [key in PieceColor]: Piece[] }>({
    [PieceColor.White]: [],
    [PieceColor.Black]: [],
  });

  retry(): void {
    console.log('Retrying game...');
  }
}
