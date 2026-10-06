import React from 'react';
import { SnakeLadderPlayer } from '../types';
import { LADDERS_MAP, SNAKES_MAP, QUESTION_TILES, BOARD_TILE_COLORS } from '../data/snakeLadderData';

interface SnakeLadderBoardViewProps {
  players: SnakeLadderPlayer[];
  currentPlayerIndex: number;
  isGraphicMode?: boolean;
  onTileClick?: (tileNumber: number) => void;
}

// Convert tile number (1-100) to percentage center coordinates (0-100)
export function getTileCoordinates(tileNumber: number): { x: number; y: number } {
  const zeroIndex = Math.max(0, Math.min(99, tileNumber - 1));
  const rowFromBottom = Math.floor(zeroIndex / 10);
  const rowIndex = 9 - rowFromBottom; // 0 is top row (100-91), 9 is bottom row (1-10)

  let colIndex = 0;
  if (rowFromBottom % 2 === 0) {
    // Even rows: left to right (1..10, 21..30, 41..50, 61..70, 81..90)
    colIndex = zeroIndex % 10;
  } else {
    // Odd rows: right to left (20..11, 40..31, 60..51, 80..71, 100..91)
    colIndex = 9 - (zeroIndex % 10);
  }

  // Center coordinate in percentage
  const x = colIndex * 10 + 5;
  const y = rowIndex * 10 + 5;
  return { x, y };
}

export const SnakeLadderBoardView: React.FC<SnakeLadderBoardViewProps> = ({
  players,
  currentPlayerIndex,
  isGraphicMode = false,
  onTileClick,
}) => {
  // Build 10x10 matrix rows: top row 100 down to 91, bottom row 1 to 10
  const boardMatrix: number[][] = [];
  for (let r = 9; r >= 0; r--) {
    const row: number[] = [];
    for (let c = 0; c < 10; c++) {
      let num = 0;
      if (r % 2 === 0) {
        // Even row from bottom: left to right
        num = r * 10 + c + 1;
      } else {
        // Odd row from bottom: right to left
        num = r * 10 + (9 - c) + 1;
      }
      row.push(num);
    }
    boardMatrix.push(row);
  }

  // Helper to draw realistic wooden ladder between tile A (bottom) and tile B (top)
  const renderLadderSvg = (fromTile: number, toTile: number, key: string) => {
    const start = getTileCoordinates(fromTile);
    const end = getTileCoordinates(toTile);

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy);
    if (length === 0) return null;

    // Normal perpendicular vector for ladder width
    const width = 2.4; // width percentage
    const nx = (-dy / length) * (width / 2);
    const ny = (dx / length) * (width / 2);

    // 2 Rails
    const leftRailStart = { x: start.x + nx, y: start.y + ny };
    const leftRailEnd = { x: end.x + nx, y: end.y + ny };
    const rightRailStart = { x: start.x - nx, y: start.y - ny };
    const rightRailEnd = { x: end.x - nx, y: end.y - ny };

    // Rungs (anak tangga)
    const stepsCount = Math.max(3, Math.floor(length / 4.8));
    const rungs = [];
    for (let i = 1; i < stepsCount; i++) {
      const t = i / stepsCount;
      const lx = leftRailStart.x + (leftRailEnd.x - leftRailStart.x) * t;
      const ly = leftRailStart.y + (leftRailEnd.y - leftRailStart.y) * t;
      const rx = rightRailStart.x + (rightRailEnd.x - rightRailStart.x) * t;
      const ry = rightRailStart.y + (rightRailEnd.y - rightRailStart.y) * t;
      rungs.push({ lx, ly, rx, ry, key: `${key}-step-${i}` });
    }

    return (
      <g key={key} className="filter drop-shadow-md pointer-events-none select-none">
        {/* Soft shadow */}
        <line
          x1={leftRailStart.x + 0.6}
          y1={leftRailStart.y + 0.6}
          x2={leftRailEnd.x + 0.6}
          y2={leftRailEnd.y + 0.6}
          stroke="#00000040"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <line
          x1={rightRailStart.x + 0.6}
          y1={rightRailStart.y + 0.6}
          x2={rightRailEnd.x + 0.6}
          y2={rightRailEnd.y + 0.6}
          stroke="#00000040"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Rails in rich warm wood tones */}
        <line
          x1={leftRailStart.x}
          y1={leftRailStart.y}
          x2={leftRailEnd.x}
          y2={leftRailEnd.y}
          stroke="#8B4513"
          strokeWidth="0.95"
          strokeLinecap="round"
        />
        <line
          x1={rightRailStart.x}
          y1={rightRailStart.y}
          x2={rightRailEnd.x}
          y2={rightRailEnd.y}
          stroke="#8B4513"
          strokeWidth="0.95"
          strokeLinecap="round"
        />

        {/* Wood inner highlights */}
        <line
          x1={leftRailStart.x}
          y1={leftRailStart.y}
          x2={leftRailEnd.x}
          y2={leftRailEnd.y}
          stroke="#CD853F"
          strokeWidth="0.45"
          strokeLinecap="round"
        />
        <line
          x1={rightRailStart.x}
          y1={rightRailStart.y}
          x2={rightRailEnd.x}
          y2={rightRailEnd.y}
          stroke="#CD853F"
          strokeWidth="0.45"
          strokeLinecap="round"
        />

        {/* Wooden Rungs */}
        {rungs.map((r) => (
          <g key={r.key}>
            <line
              x1={r.lx + 0.3}
              y1={r.ly + 0.3}
              x2={r.rx + 0.3}
              y2={r.ry + 0.3}
              stroke="#00000030"
              strokeWidth="0.9"
              strokeLinecap="round"
            />
            <line
              x1={r.lx}
              y1={r.ly}
              x2={r.rx}
              y2={r.ry}
              stroke="#7A3803"
              strokeWidth="0.8"
              strokeLinecap="round"
            />
            <line
              x1={r.lx}
              y1={r.ly}
              x2={r.rx}
              y2={r.ry}
              stroke="#D2691E"
              strokeWidth="0.4"
              strokeLinecap="round"
            />
          </g>
        ))}
      </g>
    );
  };

  // Helper to draw vivid cartoon smiling snakes matching the user's illustration
  const renderSnakeSvg = (
    headTile: number,
    tailTile: number,
    controlOffsets: { cx1: number; cy1: number; cx2: number; cy2: number },
    colorMain: string,
    colorBelly: string,
    key: string,
    name: string
  ) => {
    const head = getTileCoordinates(headTile);
    const tail = getTileCoordinates(tailTile);

    // Cubic bezier path from head to tail
    const c1x = head.x + controlOffsets.cx1;
    const c1y = head.y + controlOffsets.cy1;
    const c2x = tail.x + controlOffsets.cx2;
    const c2y = tail.y + controlOffsets.cy2;

    const bodyPath = `M ${head.x} ${head.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${tail.x} ${tail.y}`;

    return (
      <g key={key} className="pointer-events-none select-none">
        {/* Soft Drop Shadow for snake body */}
        <path
          d={bodyPath}
          fill="none"
          stroke="#00000045"
          strokeWidth="2.8"
          strokeLinecap="round"
          transform="translate(0.6, 0.8)"
        />

        {/* Snake main body */}
        <path
          d={bodyPath}
          fill="none"
          stroke={colorMain}
          strokeWidth="2.6"
          strokeLinecap="round"
        />

        {/* Snake belly / lighter stripes */}
        <path
          d={bodyPath}
          fill="none"
          stroke={colorBelly}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeDasharray="2.5 1.5"
          opacity="0.85"
        />

        {/* Cartoon Snake Head at Head Tile */}
        <g transform={`translate(${head.x}, ${head.y})`}>
          {/* Head shadow */}
          <ellipse cx="0.4" cy="0.4" rx="3.6" ry="3.2" fill="#00000030" />
          {/* Head circle */}
          <ellipse cx="0" cy="0" rx="3.5" ry="3.1" fill={colorMain} stroke="#1e293b" strokeWidth="0.4" />
          <ellipse cx="0" cy="0.5" rx="2.5" ry="1.8" fill={colorBelly} opacity="0.6" />

          {/* Friendly Cartoon Eyes */}
          <circle cx="-1.1" cy="-1.1" r="1.1" fill="#ffffff" stroke="#0f172a" strokeWidth="0.3" />
          <circle cx="1.1" cy="-1.1" r="1.1" fill="#ffffff" stroke="#0f172a" strokeWidth="0.3" />
          {/* Eye pupils looking happy */}
          <circle cx="-0.9" cy="-1.0" r="0.55" fill="#0f172a" />
          <circle cx="1.3" cy="-1.0" r="0.55" fill="#0f172a" />
          <circle cx="-0.7" cy="-1.2" r="0.2" fill="#ffffff" />
          <circle cx="1.5" cy="-1.2" r="0.2" fill="#ffffff" />

          {/* Cute Smiling Mouth & Cheek */}
          <path d="M -1.4 0.6 Q 0 1.9 1.4 0.6" fill="none" stroke="#0f172a" strokeWidth="0.4" strokeLinecap="round" />
          {/* Tongue sticking out */}
          <path d="M 0 1.2 Q 0.4 2.2 0.8 2.6 M 0.8 2.6 L 0.5 3.1 M 0.8 2.6 L 1.2 3.0" fill="none" stroke="#e11d48" strokeWidth="0.35" strokeLinecap="round" />
        </g>

        {/* Snake Tail Tip */}
        <circle cx={tail.x} cy={tail.y} r="1.0" fill={colorMain} stroke="#0f172a" strokeWidth="0.3" />
      </g>
    );
  };

  return (
    <div className="relative w-full aspect-square max-w-[540px] sm:max-w-[580px] mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-slate-900 select-none">
      {/* 1. GRAPHIC BACKGROUND MODE OR CHECKERED TILES */}
      {isGraphicMode ? (
        <div className="absolute inset-0 w-full h-full">
          <img
            src="/snake_ladder_board.jpg"
            alt="Papan Ular Tangga Edukasi"
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        /* 2. AUTHENTIC 100-CHECKERED TILES MATCHING USER'S IMAGE */
        <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 w-full h-full">
          {boardMatrix.map((row) =>
            row.map((tileNum) => {
              const bgColor = BOARD_TILE_COLORS[tileNum] || '#ffd166';
              const isQuestion = QUESTION_TILES.has(tileNum);
              const isStart = tileNum === 1;
              const isFinish = tileNum === 100;

              return (
                <div
                  key={tileNum}
                  onClick={() => onTileClick && onTileClick(tileNum)}
                  style={{ backgroundColor: bgColor }}
                  className="relative flex items-center justify-center border-[0.7px] border-black/15 transition-transform cursor-pointer hover:brightness-105"
                >
                  {/* Large Bold White Number */}
                  <span
                    className={`font-black tracking-tight text-white select-none ${
                      isFinish || isStart
                        ? 'text-xs sm:text-base font-extrabold text-white drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.8)]'
                        : 'text-[11px] sm:text-sm drop-shadow-[0_1.2px_1.5px_rgba(0,0,0,0.7)]'
                    }`}
                    style={{
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      textShadow: '0 1px 2px rgba(0,0,0,0.7), 0 0 1px rgba(0,0,0,0.9)',
                    }}
                  >
                    {tileNum}
                  </span>

                  {/* Special Badge Overlays */}
                  {isFinish && (
                    <span className="absolute top-0.5 right-0.5 text-[9px] sm:text-[11px] drop-shadow-sm">
                      🏁
                    </span>
                  )}
                  {isQuestion && (
                    <span
                      className="absolute bottom-0.5 right-0.5 text-[8px] sm:text-[10px] text-amber-200 drop-shadow-md"
                      title="Petak Soal Bahasa Inggris"
                    >
                      ⭐
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 2. VECTOR SVG OVERLAY (SNAKES & LADDERS) */}
      {!isGraphicMode && (
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          style={{ width: '100%', height: '100%' }}
        >
          {/* DEFINITIONS FOR GRADIENTS & PATTERNS */}
          <defs>
            <linearGradient id="ladderWood" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B4513" />
              <stop offset="50%" stopColor="#CD853F" />
              <stop offset="100%" stopColor="#5C2E0B" />
            </linearGradient>
          </defs>

          {/* 7 WOODEN LADDERS MATCHING THE USER'S IMAGE */}
          {/* 1. Ladder 4 to 16 */}
          {renderLadderSvg(4, 16, 'ladder-4-16')}
          {/* 2. Ladder 13 to 34 */}
          {renderLadderSvg(13, 34, 'ladder-13-34')}
          {/* 3. Ladder 33 to 49 */}
          {renderLadderSvg(33, 49, 'ladder-33-49')}
          {/* 4. Ladder 42 to 63 */}
          {renderLadderSvg(42, 63, 'ladder-42-63')}
          {/* 5. Ladder 50 to 69 */}
          {renderLadderSvg(50, 69, 'ladder-50-69')}
          {/* 6. Ladder 62 to 81 */}
          {renderLadderSvg(62, 81, 'ladder-62-81')}
          {/* 7. Ladder 74 to 92 */}
          {renderLadderSvg(74, 92, 'ladder-74-92')}

          {/* 8 CARTOON SMILING SNAKES MATCHING USER'S IMAGE */}
          {/* Snake 1: Belang Kuning-Merah (Head 14 -> Tail 5) */}
          {renderSnakeSvg(14, 5, { cx1: -6, cy1: 8, cx2: 8, cy2: -6 }, '#e63946', '#ffbe0b', 'snake-14-5', 'Striped')}

          {/* Snake 2: Jingga (Head 21 -> Tail 2) */}
          {renderSnakeSvg(21, 2, { cx1: 8, cy1: 6, cx2: -6, cy2: -8 }, '#fb8500', '#ffb703', 'snake-21-2', 'Orange')}

          {/* Snake 3: Hijau Muda (Head 38 -> Tail 18) */}
          {renderSnakeSvg(38, 18, { cx1: -10, cy1: 8, cx2: 12, cy2: -8 }, '#52b788', '#d8f3dc', 'snake-38-18', 'Green')}

          {/* Snake 4: Biru Ceria (Head 47 -> Tail 31) */}
          {renderSnakeSvg(47, 31, { cx1: 8, cy1: 8, cx2: -12, cy2: 4 }, '#0077b6', '#90e0ef', 'snake-47-31', 'Blue')}

          {/* Snake 5: Ungu Berbintik (Head 66 -> Tail 45) */}
          {renderSnakeSvg(66, 45, { cx1: 10, cy1: 8, cx2: -8, cy2: -4 }, '#7209b7', '#f72585', 'snake-66-45', 'Purple')}

          {/* Snake 6: Hijau Sisik Kuning (Head 76 -> Tail 58) */}
          {renderSnakeSvg(76, 58, { cx1: -8, cy1: 10, cx2: 10, cy2: -4 }, '#2d6a4f', '#d9ed92', 'snake-76-58', 'Emerald')}

          {/* Snake 7: Merah Garis Putih (Head 89 -> Tail 53) */}
          {renderSnakeSvg(89, 53, { cx1: 12, cy1: 12, cx2: -12, cy2: -10 }, '#d00000', '#ffffff', 'snake-89-53', 'Red')}

          {/* Snake 8: Pink Raksasa (Head 99 -> Tail 41) */}
          {renderSnakeSvg(99, 41, { cx1: -18, cy1: 22, cx2: 16, cy2: -14 }, '#f72585', '#ffc6ff', 'snake-99-41', 'GiantPink')}
        </svg>
      )}

      {/* 3. INTERACTIVE FLOATING PLAYER TOKENS */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-20">
        {players.map((p, idx) => {
          const coords = getTileCoordinates(p.position);
          const isTurn = idx === currentPlayerIndex;

          // Offset token slightly if multiple players are on the same tile
          const playersOnSameTile = players.filter((other) => other.position === p.position);
          const sameTileIndex = playersOnSameTile.findIndex((other) => other.id === p.id);
          const totalOnTile = playersOnSameTile.length;

          let offsetX = 0;
          let offsetY = 0;
          if (totalOnTile > 1) {
            const spreadRadius = 2.2;
            const angle = (sameTileIndex / totalOnTile) * 2 * Math.PI;
            offsetX = Math.cos(angle) * spreadRadius;
            offsetY = Math.sin(angle) * spreadRadius;
          }

          const finalX = coords.x + offsetX;
          const finalY = coords.y + offsetY;

          return (
            <div
              key={p.id}
              style={{
                left: `${finalX}%`,
                top: `${finalY}%`,
                transform: 'translate(-50%, -50%)',
                transition: 'left 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              className="absolute pointer-events-auto"
            >
              {/* Token Container */}
              <div
                className={`relative flex items-center justify-center rounded-full transition-transform select-none ${
                  isTurn ? 'scale-125 z-30 animate-bounce' : 'scale-100 z-20'
                }`}
              >
                {/* Glowing Active Turn Aura */}
                {isTurn && (
                  <div className="absolute inset-0 rounded-full bg-amber-400 blur-xs animate-ping opacity-75" />
                )}

                {/* Token Base Pin */}
                <div
                  className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-sm sm:text-base font-bold shadow-2xl border-2 transition-all ${
                    isTurn
                      ? 'border-amber-300 ring-3 ring-amber-400/60 bg-gradient-to-tr from-slate-900 to-indigo-950 text-white'
                      : 'border-white/90 bg-slate-900/95 text-white'
                  }`}
                >
                  <span className="filter drop-shadow-sm">{p.avatar}</span>
                </div>

                {/* Player Number Mini-Badge */}
                <div
                  className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full text-[9px] font-black flex items-center justify-center border border-white text-white shadow-xs ${
                    idx === 0
                      ? 'bg-amber-500'
                      : idx === 1
                      ? 'bg-pink-500'
                      : idx === 2
                      ? 'bg-blue-500'
                      : 'bg-emerald-500'
                  }`}
                >
                  P{idx + 1}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
