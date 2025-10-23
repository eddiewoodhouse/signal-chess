import { Injectable, computed, signal, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  Board,
  Coords,
  GameState,
  Move,
  MoveType,
  Piece,
  PieceColor,
  PieceType,
} from '../../shared/types/chess.types';
import { ThemeService } from './theme.service';

@Injectable({
  providedIn: 'root',
})
export class ChessGameService {
  private readonly themeService = inject(ThemeService);

  // Observable for animations
  private moveAnimation = new BehaviorSubject<Move | null>(null);
  private readonly initialBoard: Board = [
    // Black pieces
    [
      { type: PieceType.Rook, color: PieceColor.Black, hasMoved: false },
      { type: PieceType.Knight, color: PieceColor.Black, hasMoved: false },
      { type: PieceType.Bishop, color: PieceColor.Black, hasMoved: false },
      { type: PieceType.Queen, color: PieceColor.Black, hasMoved: false },
      { type: PieceType.King, color: PieceColor.Black, hasMoved: false },
      { type: PieceType.Bishop, color: PieceColor.Black, hasMoved: false },
      { type: PieceType.Knight, color: PieceColor.Black, hasMoved: false },
      { type: PieceType.Rook, color: PieceColor.Black, hasMoved: false },
    ],
    Array(8)
      .fill(null)
      .map(() => ({
        type: PieceType.Pawn,
        color: PieceColor.Black,
        hasMoved: false,
      })),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8)
      .fill(null)
      .map(() => ({
        type: PieceType.Pawn,
        color: PieceColor.White,
        hasMoved: false,
      })),
    [
      { type: PieceType.Rook, color: PieceColor.White, hasMoved: false },
      { type: PieceType.Knight, color: PieceColor.White, hasMoved: false },
      { type: PieceType.Bishop, color: PieceColor.White, hasMoved: false },
      { type: PieceType.Queen, color: PieceColor.White, hasMoved: false },
      { type: PieceType.King, color: PieceColor.White, hasMoved: false },
      { type: PieceType.Bishop, color: PieceColor.White, hasMoved: false },
      { type: PieceType.Knight, color: PieceColor.White, hasMoved: false },
      { type: PieceType.Rook, color: PieceColor.White, hasMoved: false },
    ],
  ];

  // State signals
  private readonly _board = signal<Board>(this.initialBoard);
  private readonly _currentPlayer = signal<PieceColor>(PieceColor.White);
  private readonly _selectedPiece = signal<{
    piece: Piece;
    coords: Coords;
  } | null>(null);
  private readonly _validMoves = signal<Move[]>([]);
  private readonly _gameState = signal<GameState>(GameState.Active);
  private readonly _lastMove = signal<Move | null>(null);
  private readonly _moveHistory = signal<Move[]>([]);

  // Track captured pieces
  private readonly _capturedPieces = signal<{ [key in PieceColor]: Piece[] }>({
    [PieceColor.White]: [],
    [PieceColor.Black]: [],
  });

  // Public computed signals
  readonly board = computed(() => this._board());
  readonly currentPlayer = computed(() => this._currentPlayer());
  readonly selectedPiece = computed(() => this._selectedPiece());
  readonly validMoves = computed(() => this._validMoves());
  readonly gameState = computed(() => this._gameState());
  readonly lastMove = computed(() => this._lastMove());
  readonly moveHistory = computed(() => this._moveHistory());
  readonly capturedPieces = computed(() => this._capturedPieces());

  // Animation observable
  readonly moveAnimationState = this.moveAnimation.asObservable();

  // Game state computed signals
  readonly isGameOver = computed(() => {
    // Check if the king is captured
    const board = this._board();
    let whiteKing = false;
    let blackKing = false;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece?.type === PieceType.King) {
          if (piece.color === PieceColor.White) whiteKing = true;
          if (piece.color === PieceColor.Black) blackKing = true;
        }
      }
    }

    return !whiteKing || !blackKing;
  });

  readonly winner = computed(() => {
    if (!this.isGameOver()) return null;

    // If white king is missing, black wins and vice versa
    const board = this._board();
    let whiteKing = false;
    let blackKing = false;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece?.type === PieceType.King) {
          if (piece.color === PieceColor.White) whiteKing = true;
          if (piece.color === PieceColor.Black) blackKing = true;
        }
      }
    }

    if (!whiteKing) return PieceColor.Black;
    if (!blackKing) return PieceColor.White;
    return null;
  });

  // Update game state computed signals
  readonly isInCheck = computed(() =>
    this.isKingInCheck(this._currentPlayer())
  );

  readonly isCheckmate = computed(() => {
    return this.isInCheck() && !this.hasAnyValidMoves(this._currentPlayer());
  });

  readonly isStalemate = computed(() => {
    return !this.isInCheck() && !this.hasAnyValidMoves(this._currentPlayer());
  });

  // Actions
  selectPiece(coords: Coords): void {
    const piece = this._board()[coords.row][coords.col];
    if (!piece || piece.color !== this._currentPlayer()) {
      this._selectedPiece.set(null);
      this._validMoves.set([]);
      return;
    }

    this._selectedPiece.set({ piece, coords });
    this._validMoves.set(this.calculateValidMoves(piece, coords));
  }

  makeMove(move: Move): void {
    // Start animation
    this.moveAnimation.next(move);

    // Update board state after animation delay
    setTimeout(() => {
      this._board.update((board) => {
        const newBoard = board.map((row) => [...row]);

        // Handle special moves
        switch (move.type) {
          case MoveType.Castle: {
            // Move king
            const piece = {
              ...newBoard[move.from.row][move.from.col]!,
              hasMoved: true,
            };
            newBoard[move.to.row][move.to.col] = piece;
            newBoard[move.from.row][move.from.col] = null;

            // Move rook
            const rookFromCol = move.to.col > move.from.col ? 7 : 0;
            const rookToCol = move.to.col > move.from.col ? 5 : 3;
            const rook = {
              ...newBoard[move.from.row][rookFromCol]!,
              hasMoved: true,
            };
            newBoard[move.from.row][rookToCol] = rook;
            newBoard[move.from.row][rookFromCol] = null;
            break;
          }

          case MoveType.EnPassant: {
            // Move pawn
            const piece = {
              ...newBoard[move.from.row][move.from.col]!,
              hasMoved: true,
            };
            newBoard[move.to.row][move.to.col] = piece;
            newBoard[move.from.row][move.from.col] = null;

            // Remove captured pawn
            newBoard[move.from.row][move.to.col] = null;
            break;
          }

          case MoveType.Promotion: {
            // Create new promoted piece
            const promotedPiece: Piece = {
              type: move.promotionType!,
              color: move.piece.color,
              hasMoved: true,
            };
            newBoard[move.to.row][move.to.col] = promotedPiece;
            newBoard[move.from.row][move.from.col] = null;
            break;
          }

          default: {
            // Standard move or capture
            const piece = {
              ...newBoard[move.from.row][move.from.col]!,
              hasMoved: true,
              lastMoveWasDoublePawn:
                move.piece.type === PieceType.Pawn &&
                Math.abs(move.to.row - move.from.row) === 2,
            };

            // Track captured pieces
            const capturedPiece = newBoard[move.to.row][move.to.col];
            if (capturedPiece) {
              this._capturedPieces.update((captured) => {
                const updated = { ...captured };
                updated[
                  capturedPiece.color === PieceColor.White
                    ? PieceColor.Black
                    : PieceColor.White
                ].push(capturedPiece);
                return updated;
              });
            }

            newBoard[move.to.row][move.to.col] = piece;
            newBoard[move.from.row][move.from.col] = null;
          }
        }

        return newBoard;
      });

      // Clear animation after it completes
      this.moveAnimation.next(null);

      // Update game state
      this._lastMove.set(move);
      this._moveHistory.update((history) => [...history, move]);
      this._selectedPiece.set(null);
      this._validMoves.set([]);

      // Update current player
      this._currentPlayer.update((current) =>
        current === PieceColor.White ? PieceColor.Black : PieceColor.White
      );

      // Check for check/checkmate
      const isInCheck = this.isKingInCheck(this._currentPlayer());
      if (isInCheck) {
        const hasValidMoves = this.hasAnyValidMoves(this._currentPlayer());
        this._gameState.set(
          hasValidMoves ? GameState.Check : GameState.Checkmate
        );
      } else {
        const hasValidMoves = this.hasAnyValidMoves(this._currentPlayer());
        this._gameState.set(
          hasValidMoves ? GameState.Active : GameState.Stalemate
        );
      }

      // End game if checkmate or stalemate
      if (
        this._gameState() === GameState.Checkmate ||
        this._gameState() === GameState.Stalemate
      ) {
        this.endGame();
      }
    }, 300); // Match animation duration from CSS
  }

  resetGame(): void {
    this._board.set(this.initialBoard);
    this._currentPlayer.set(PieceColor.White);
    this._selectedPiece.set(null);
    this._validMoves.set([]);
    this._gameState.set(GameState.Active);
    this._lastMove.set(null);
    this._moveHistory.set([]);
    this._capturedPieces.set({
      [PieceColor.White]: [],
      [PieceColor.Black]: [],
    });
    this.moveAnimation.next(null);
  }

  private endGame(): void {
    // Trigger modal with game stats
    console.log('Game Over:', {
      winner: this.winner(),
      moveHistory: this._moveHistory(),
      capturedPieces: this._capturedPieces(),
    });
    // Additional logic to trigger UI updates or navigation
  }

  private isKingInCheck(color: PieceColor): boolean {
    // Find king position
    const board = this._board();
    let kingPos: Coords | null = null;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece?.type === PieceType.King && piece.color === color) {
          kingPos = { row, col };
          break;
        }
      }
      if (kingPos) break;
    }

    if (!kingPos) return false; // King not found, should not happen in a valid game

    // Check if any opponent piece can attack the king
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.color !== color) {
          const moves = this.calculateRawMoves(piece, { row, col }, board);
          if (
            moves.some(
              (move) =>
                move.to.row === kingPos!.row && move.to.col === kingPos!.col
            )
          ) {
            return true;
          }
        }
      }
    }

    return false;
  }

  private hasAnyValidMoves(color: PieceColor): boolean {
    const board = this._board();
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.color === color) {
          const moves = this.calculateValidMoves(piece, { row, col });
          if (moves.length > 0) {
            return true;
          }
        }
      }
    }
    return false;
  }
  private wouldMoveLeaveKingInCheck(move: Move): boolean {
    // Create a temporary board to simulate the move
    const tempBoard = this._board().map((row) => [...row]);

    // Apply the move
    tempBoard[move.to.row][move.to.col] = {
      ...tempBoard[move.from.row][move.from.col]!,
      hasMoved: true,
    };
    tempBoard[move.from.row][move.from.col] = null;

    // Find king's position after move
    const color = move.piece.color;
    let kingPos: Coords | null = null;

    // If moving the king, use destination coordinates
    if (move.piece.type === PieceType.King) {
      kingPos = move.to;
    } else {
      // Otherwise, find the king's current position
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const piece = tempBoard[row][col];
          if (piece?.type === PieceType.King && piece.color === color) {
            kingPos = { row, col };
            break;
          }
        }
        if (kingPos) break;
      }
    }

    if (!kingPos) return true; // Should never happen in a valid game

    // Check if any opponent piece can attack the king
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = tempBoard[row][col];
        if (piece && piece.color !== color) {
          const moves = this.calculateRawMoves(piece, { row, col }, tempBoard);
          if (
            moves.some(
              (m) => m.to.row === kingPos!.row && m.to.col === kingPos!.col
            )
          ) {
            return true;
          }
        }
      }
    }

    return false;
  }

  private calculateValidMoves(piece: Piece, coords: Coords): Move[] {
    // Get all possible moves without considering check
    const rawMoves = this.calculateRawMoves(piece, coords, this._board());

    // Filter out moves that would leave or keep the king in check
    return rawMoves.filter((move) => !this.wouldMoveLeaveKingInCheck(move));
  }

  private calculateRawMoves(
    piece: Piece,
    coords: Coords,
    board: Board
  ): Move[] {
    const moves: Move[] = [];

    const isWithinBounds = (row: number, col: number) =>
      row >= 0 && row < 8 && col >= 0 && col < 8;

    const addMove = (toRow: number, toCol: number, type: MoveType) => {
      if (isWithinBounds(toRow, toCol)) {
        const target = board[toRow][toCol];
        if (!target || target.color !== piece.color) {
          moves.push({
            from: coords,
            to: { row: toRow, col: toCol },
            type,
            piece,
            capturedPiece: target || undefined,
          });
        }
      }
    };

    switch (piece.type) {
      case PieceType.Pawn: {
        const direction = piece.color === PieceColor.White ? -1 : 1;
        const startRow = piece.color === PieceColor.White ? 6 : 1;

        // Standard move
        if (!board[coords.row + direction][coords.col]) {
          addMove(coords.row + direction, coords.col, MoveType.Normal);

          // Double move from starting position
          if (
            coords.row === startRow &&
            !board[coords.row + 2 * direction][coords.col]
          ) {
            addMove(coords.row + 2 * direction, coords.col, MoveType.Normal);
          }
        }

        // Captures
        [-1, 1].forEach((offset) => {
          const targetCol = coords.col + offset;
          const target = board[coords.row + direction]?.[targetCol];
          if (target && target.color !== piece.color) {
            addMove(coords.row + direction, targetCol, MoveType.Capture);
          }
        });

        // En passant
        if (piece.lastMoveWasDoublePawn) {
          // Logic for en passant
        }
        break;
      }
      case PieceType.Rook:
      case PieceType.Bishop:
      case PieceType.Queen: {
        const directions =
          piece.type === PieceType.Rook
            ? [
                { row: 1, col: 0 },
                { row: -1, col: 0 },
                { row: 0, col: 1 },
                { row: 0, col: -1 },
              ]
            : piece.type === PieceType.Bishop
            ? [
                { row: 1, col: 1 },
                { row: 1, col: -1 },
                { row: -1, col: 1 },
                { row: -1, col: -1 },
              ]
            : [
                { row: 1, col: 0 },
                { row: -1, col: 0 },
                { row: 0, col: 1 },
                { row: 0, col: -1 },
                { row: 1, col: 1 },
                { row: 1, col: -1 },
                { row: -1, col: 1 },
                { row: -1, col: -1 },
              ];

        directions.forEach(({ row: dRow, col: dCol }) => {
          let r = coords.row + dRow;
          let c = coords.col + dCol;
          while (isWithinBounds(r, c)) {
            const target = board[r][c];
            if (target) {
              if (target.color !== piece.color) {
                addMove(r, c, MoveType.Capture);
              }
              break;
            }
            addMove(r, c, MoveType.Normal);
            r += dRow;
            c += dCol;
          }
        });
        break;
      }
      case PieceType.Knight: {
        const knightMoves = [
          { row: 2, col: 1 },
          { row: 2, col: -1 },
          { row: -2, col: 1 },
          { row: -2, col: -1 },
          { row: 1, col: 2 },
          { row: 1, col: -2 },
          { row: -1, col: 2 },
          { row: -1, col: -2 },
        ];

        knightMoves.forEach(({ row: dRow, col: dCol }) => {
          addMove(coords.row + dRow, coords.col + dCol, MoveType.Normal);
        });
        break;
      }
      case PieceType.King: {
        const kingMoves = [
          { row: 1, col: 0 },
          { row: -1, col: 0 },
          { row: 0, col: 1 },
          { row: 0, col: -1 },
          { row: 1, col: 1 },
          { row: 1, col: -1 },
          { row: -1, col: 1 },
          { row: -1, col: -1 },
        ];

        kingMoves.forEach(({ row: dRow, col: dCol }) => {
          addMove(coords.row + dRow, coords.col + dCol, MoveType.Normal);
        });

        // Castling logic
        if (!piece.hasMoved) {
          // Logic for castling
        }
        break;
      }
    }

    return moves;
  }

  getPieceImage(type: PieceType | string, color: PieceColor | string): string {
    return `/assets/pieces/${color.toLowerCase()}_${type.toLowerCase()}.svg`;
  }
}
