import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ChessGameService } from '../../../../core/services/chess-game.service';
import { GameState, PieceColor } from '../../../../shared/types/chess.types';

@Component({
  selector: 'app-game-status',
  standalone: true,
  imports: [],
  templateUrl: './game-status.component.html',
  styleUrl: './game-status.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameStatusComponent {
  protected readonly chessGameService = inject(ChessGameService);
  protected readonly currentPlayer = this.chessGameService.currentPlayer;
  protected readonly isGameOver = this.chessGameService.isGameOver;
  protected readonly winner = this.chessGameService.winner;

  protected readonly PieceColor = PieceColor;
  protected readonly gameState = this.chessGameService.gameState;
  protected readonly GameState = GameState;

  protected resetGame(): void {
    this.chessGameService.resetGame();
  }
}
