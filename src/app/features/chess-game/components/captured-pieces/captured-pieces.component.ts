import { Component, inject, input, signal } from '@angular/core';
import { PieceColor } from '../../../../shared/types/chess.types';
import { ChessGameService } from '../../../../core/services/chess-game.service';

@Component({
  selector: 'app-captured-pieces',
  templateUrl: './captured-pieces.component.html',
  styleUrls: ['./captured-pieces.component.scss'],
})
export class CapturedPiecesComponent {
  chessGameService = inject(ChessGameService);
}
