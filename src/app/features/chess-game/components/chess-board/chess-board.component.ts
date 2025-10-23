import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ChessGameService } from '../../../../core/services/chess-game.service';
import { Coords, GameState, Move, MoveType, Piece, PieceColor, PieceType } from '../../../../shared/types/chess.types';

@Component({
  selector: 'app-chess-board',
  standalone: true,
  imports: [],
  templateUrl: './chess-board.component.html',
  styleUrl: './chess-board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChessBoardComponent {
  protected readonly chessGameService = inject(ChessGameService);
  
  // Game state signals
  protected readonly board = this.chessGameService.board;
  protected readonly selectedPiece = this.chessGameService.selectedPiece;
  protected readonly validMoves = this.chessGameService.validMoves;
  protected readonly gameState = this.chessGameService.gameState;
  protected readonly lastMove = this.chessGameService.lastMove;
  protected readonly currentPlayer = this.chessGameService.currentPlayer;

  // Animation state
  protected readonly currentAnimation = toSignal(this.chessGameService.moveAnimationState);
  protected readonly promotionDialogState = signal<{coords: Coords, piece: Piece} | null>(null);
  
  // Constants
  protected readonly PieceColor = PieceColor;
  protected readonly promotionPieces = [
    PieceType.Queen,
    PieceType.Rook,
    PieceType.Bishop,
    PieceType.Knight
  ];

  // Computed values for animation states
  protected readonly showPromotionDialog = computed(() => this.promotionDialogState() !== null);

  protected isSquareSelected(row: number, col: number): boolean {
    const selectedPiece = this.selectedPiece();
    return selectedPiece?.coords.row === row && selectedPiece?.coords.col === col;
  }

  protected isPossibleMove(row: number, col: number): boolean {
    return this.validMoves().some(
      move => move.to.row === row && move.to.col === col
    );
  }

  protected isPossibleCapture(row: number, col: number): boolean {
    return this.validMoves().some(
      move => move.to.row === row && move.to.col === col && 
      (move.type === MoveType.Capture || move.type === MoveType.EnPassant)
    );
  }

  protected isInCheck(row: number, col: number): boolean {
    const piece = this.board()[row][col];
    return piece?.type === PieceType.King && 
           this.gameState() === GameState.Check &&
           piece.color === this.currentPlayer();
  }

  protected isLastMove(row: number, col: number): boolean {
    const lastMove = this.lastMove();
    if (!lastMove) return false;
    return (
      (row === lastMove.from.row && col === lastMove.from.col) ||
      (row === lastMove.to.row && col === lastMove.to.col)
    );
  }

  protected isAnimating(row: number, col: number): boolean {
    const animation = this.currentAnimation();
    if (!animation) return false;
    return row === animation.from.row && col === animation.from.col;
  }

  protected isCaptured(row: number, col: number): boolean {
    const animation = this.currentAnimation();
    if (!animation || animation.type !== MoveType.Capture) return false;
    return row === animation.to.row && col === animation.to.col;
  }

  protected getPieceTransform(row: number, col: number): string {
    const animation = this.currentAnimation();
    if (!animation || !this.isAnimating(row, col)) return '';
    
    const fromRect = this.getSquareRect(animation.from.row, animation.from.col);
    const toRect = this.getSquareRect(animation.to.row, animation.to.col);
    
    const translateX = toRect.left - fromRect.left;
    const translateY = toRect.top - fromRect.top;
    
    return `translate(${translateX}px, ${translateY}px)`;
  }


  protected onSquareClick(coords: Coords): void {
    // If promotion dialog is open, ignore clicks outside
    if (this.showPromotionDialog()) return;

    const selectedPiece = this.selectedPiece();

    if (selectedPiece) {
      const validMove = this.validMoves().find(
        move => move.to.row === coords.row && move.to.col === coords.col
      );

      if (validMove) {
        if (this.isPromotionMove(validMove)) {
          this.promotionDialogState.set({ coords, piece: selectedPiece.piece });
        } else {
          this.chessGameService.makeMove(validMove);
        }
      } else {
        this.chessGameService.selectPiece(coords);
      }
    } else {
      this.chessGameService.selectPiece(coords);
    }
  }

  protected onPromotionSelect(promotionType: PieceType): void {
    const promotionState = this.promotionDialogState();
    if (!promotionState) return;

    const selectedPiece = this.selectedPiece();
    if (!selectedPiece) return;

    const move: Move = {
      from: selectedPiece.coords,
      to: promotionState.coords,
      type: MoveType.Promotion,
      piece: selectedPiece.piece,
      promotionType
    };

    this.promotionDialogState.set(null);
    this.chessGameService.makeMove(move);
  }

  private isPromotionMove(move: Move): boolean {
    const piece = move.piece;
    const targetRow = move.to.row;
    return piece.type === PieceType.Pawn && 
           ((piece.color === PieceColor.White && targetRow === 0) ||
            (piece.color === PieceColor.Black && targetRow === 7));
  }

  private getSquareRect(row: number, col: number): DOMRect {
    const board = document.querySelector('.chessboard');
    if (!board) throw new Error('Chess board not found');
    
    const square = board.children[row].children[col] as HTMLElement;
    return square.getBoundingClientRect();
  }
}
