export enum PieceType {
  Pawn = 'pawn',
  Rook = 'rook',
  Knight = 'knight',
  Bishop = 'bishop',
  Queen = 'queen',
  King = 'king',
}

export enum PieceColor {
  White = 'white',
  Black = 'black',
}

export enum GameState {
  Active = 'active',
  // Added new game states for clarity
  Check = 'check',
  Checkmate = 'checkmate',
  Stalemate = 'stalemate'
}

export enum MoveType {
  Normal = 'normal',
  Capture = 'capture',
  Castle = 'castle',
  EnPassant = 'en-passant',
  Promotion = 'promotion'
}

export interface Piece {
  type: PieceType;
  color: PieceColor;
  hasMoved?: boolean;
  lastMoveWasDoublePawn?: boolean; // For en passant
}

export type Board = (Piece | null)[][];

export interface Coords {
  row: number;
  col: number;
}

export interface Move {
  from: Coords;
  to: Coords;
  type: MoveType;
  piece: Piece;
  capturedPiece?: Piece;
  promotionType?: PieceType;
}