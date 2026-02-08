"use client";

import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
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

        {/* Description & Explanation */}
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
          <p className="text-sm leading-relaxed text-gray-700">
            {card.description}
          </p>
          {card.explanation && (
            <p className="mt-3 text-sm italic leading-relaxed text-gray-600">
              {card.explanation}
            </p>
          )}
        </section>

        {/* Implementation Examples */}
        <section aria-labelledby="modal-examples-heading">
          <h3
            id="modal-examples-heading"
            className="mb-3 text-base font-semibold text-gray-900"
          >
            Implementation Examples
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Good example */}
            <div className="overflow-hidden rounded-lg border-2 border-green-200">
              <div className="flex items-center gap-1.5 bg-green-50 px-3 py-2">
                <CheckCircle2
                  className="h-4 w-4 text-green-600"
                  aria-hidden="true"
                />
                <span className="text-xs font-semibold uppercase tracking-wide text-green-800">
                  Good Example
                </span>
              </div>
              <pre className="overflow-x-auto bg-gray-950 px-4 py-3 text-xs leading-relaxed">
                <code className="whitespace-pre-wrap break-words text-green-400">
                  {card.implementationExamples.good}
                </code>
              </pre>
            </div>

            {/* Bad example */}
            <div className="overflow-hidden rounded-lg border-2 border-red-200">
              <div className="flex items-center gap-1.5 bg-red-50 px-3 py-2">
                <XCircle
                  className="h-4 w-4 text-red-600"
                  aria-hidden="true"
                />
                <span className="text-xs font-semibold uppercase tracking-wide text-red-800">
                  Bad Example
                </span>
              </div>
              <pre className="overflow-x-auto bg-gray-950 px-4 py-3 text-xs leading-relaxed">
                <code className="whitespace-pre-wrap break-words text-red-400">
                  {card.implementationExamples.bad}
                </code>
              </pre>
            </div>
          </div>
        </section>

        {/* Common Violations */}
        {card.commonViolations.length > 0 && (
          <section aria-labelledby="modal-violations-heading">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle
                className="h-5 w-5 text-amber-500 shrink-0"
                aria-hidden="true"
              />
              <h3
                id="modal-violations-heading"
                className="text-base font-semibold text-gray-900"
              >
                Common Violations
              </h3>
            </div>
            <ul className="space-y-2" role="list">
              {card.commonViolations.map((violation, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-gray-700"
                >
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500"
                    aria-hidden="true"
                  />
                  {violation}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Remediation Strategies */}
        {card.remediationStrategies.length > 0 && (
          <section aria-labelledby="modal-remediation-heading">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb
                className="h-5 w-5 text-blue-500 shrink-0"
                aria-hidden="true"
              />
              <h3
                id="modal-remediation-heading"
                className="text-base font-semibold text-gray-900"
              >
                Remediation Strategies
              </h3>
            </div>
            <ol className="list-none space-y-2" role="list">
              {card.remediationStrategies.map((strategy, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-sm text-gray-700"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{strategy}</span>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </Modal>
  );
}
