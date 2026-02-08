"use client";

import {
  BookOpen,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { WcagCard, WcagPrinciple } from "@/types";

/* ---- Props ---- */

export interface WcagCardModalProps {
  card: WcagCard | null;
  isOpen: boolean;
  onClose: () => void;
}

/* ---- Principle badge variant mapping ---- */

const principleBadgeStyles: Record<WcagPrinciple, string> = {
  Perceivable: "bg-blue-100 text-blue-800",
  Operable: "bg-green-100 text-green-800",
  Understandable: "bg-purple-100 text-purple-800",
  Robust: "bg-orange-100 text-orange-800",
};

/* ---- Component ---- */

export default function WcagCardModal({
  card,
  isOpen,
  onClose,
}: WcagCardModalProps) {
  if (!card) return null;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={`${card.criterionNumber} \u2013 ${card.title}`}
      className="max-w-2xl max-h-[90vh] flex flex-col"
    >
      {/* Scrollable content area */}
      <div className="overflow-y-auto space-y-6">
        {/* Principle & Level badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            className={cn(principleBadgeStyles[card.principle])}
            aria-label={`Principle: ${card.principle}`}
          >
            {card.principle}
          </Badge>
          <Badge variant="default" aria-label={`Level: ${card.level}`}>
            Level {card.level}
          </Badge>
        </div>

        {/* Description */}
        <section aria-labelledby="modal-desc-heading">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen
              className="h-5 w-5 text-gray-500 shrink-0"
              aria-hidden="true"
            />
            <h3
              id="modal-desc-heading"
              className="text-base font-semibold text-gray-900"
            >
              Description
            </h3>
          </div>
          <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
            {card.description}
          </p>
        </section>

        {/* Learn More Link */}
        {card.url && (
          <section>
            <a
              href={card.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 underline"
            >
              Learn more about {card.criterionNumber}
              <span aria-hidden="true">→</span>
              <span className="sr-only">(opens in new window)</span>
            </a>
          </section>
        )}
      </div>
    </Modal>
  );
}
