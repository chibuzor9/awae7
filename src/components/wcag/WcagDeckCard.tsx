"use client";

import { useState, useCallback } from "react";
import { RotateCcw, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import type { WcagCard, WcagPrinciple } from "@/types";

/* ---- Principle colour mapping ---- */

const principleBadgeColors: Record<WcagPrinciple, { bg: string; text: string }> = {
  Perceivable: { bg: "bg-blue-100", text: "text-blue-800" },
  Operable: { bg: "bg-green-100", text: "text-green-800" },
  Understandable: { bg: "bg-purple-100", text: "text-purple-800" },
  Robust: { bg: "bg-orange-100", text: "text-orange-800" },
};

const principleBorderAccent: Record<WcagPrinciple, string> = {
  Perceivable: "border-blue-400",
  Operable: "border-green-400",
  Understandable: "border-purple-400",
  Robust: "border-orange-400",
};

/* ---- Props ---- */

export interface WcagDeckCardProps {
  card: WcagCard;
  onSelect?: (card: WcagCard) => void;
}

/* ---- Component ---- */

export default function WcagDeckCard({ card, onSelect }: WcagDeckCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const colors = principleBadgeColors[card.principle];
  const accent = principleBorderAccent[card.principle];

  const toggleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleFlip();
      }
    },
    [toggleFlip]
  );

  const handleLearnMore = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onSelect?.(card);
    },
    [card, onSelect]
  );

  const handleLearnMoreKey = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.stopPropagation();
        e.preventDefault();
        onSelect?.(card);
      }
    },
    [card, onSelect]
  );

  return (
    <div
      className="group h-72 w-full cursor-pointer"
      style={{ perspective: "1000px" }}
      onClick={toggleFlip}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`WCAG ${card.criterionNumber} ${card.title}. ${
        isFlipped
          ? "Showing description. Press Enter to flip back."
          : "Press Enter to see description."
      }`}
    >
      {/* Card wrapper for 3D flip transform */}
      <div
        className={cn(
          "relative h-full w-full transition-transform duration-500 ease-in-out",
          isFlipped && "[transform:rotateY(180deg)]"
        )}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* ======== FRONT SIDE ======== */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl border-2 bg-white p-6 text-center shadow-sm",
            accent,
            "transition-shadow group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-blue-500 group-focus-visible:ring-offset-2"
          )}
          style={{ backfaceVisibility: "hidden" }}
          aria-hidden={isFlipped}
        >
          {/* Criterion number */}
          <span className="text-4xl font-extrabold tracking-tight text-gray-900">
            {card.criterionNumber}
          </span>

          {/* Title */}
          <h3 className="text-base font-semibold leading-snug text-gray-700">
            {card.title}
          </h3>

          {/* Principle + Level badges */}
          <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
            <Badge
              className={cn(colors.bg, colors.text)}
              aria-label={`Principle: ${card.principle}`}
            >
              {card.principle}
            </Badge>
            <Badge variant="default" aria-label={`Level: ${card.level}`}>
              Level {card.level}
            </Badge>
          </div>

          {/* Flip hint */}
          <span className="mt-2 flex items-center gap-1 text-xs text-gray-400">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Click to flip
          </span>
        </div>

        {/* ======== BACK SIDE ======== */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col gap-3 overflow-y-auto rounded-xl border-2 bg-white p-5 shadow-sm",
            accent,
            "transition-shadow group-hover:shadow-md"
          )}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
          aria-hidden={!isFlipped}
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <span className="text-sm font-bold text-gray-900">
              {card.criterionNumber} &mdash; {card.title}
            </span>
          </div>

          {/* Description / explanation */}
          <p className="flex-1 text-sm leading-relaxed text-gray-600">
            {card.explanation}
          </p>

          {/* Learn more button */}
          {onSelect && (
            <button
              type="button"
              className="mt-auto inline-flex items-center justify-center gap-1.5 self-end rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              onClick={handleLearnMore}
              onKeyDown={handleLearnMoreKey}
              aria-label={`Learn more about WCAG ${card.criterionNumber} ${card.title}`}
            >
              Learn more
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
