"use client";

import { createPortal } from "react-dom";
import Image from "next/image";
import {
  X,
  Trash2,
  Calendar,
  Hash,
  Sparkles,
  Edit3,
  Check,
  X as XIcon,
} from "lucide-react";
import { Character } from "@/types/characters";
import { useUpdateCharacter } from "@/hooks/useCharacters";
import { useState, useEffect } from "react";
import { useTranslations } from "@/hooks/useTranslations";

interface CharacterDetailModalProps {
  character: Character;
  onClose: () => void;
  onDelete?: (id: string) => Promise<void>;
}

export default function CharacterDetailModal({
  character,
  onClose,
  onDelete,
}: CharacterDetailModalProps) {
  const t = useTranslations("Character");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(character.name);
  const [displayName, setDisplayName] = useState(character.name);
  const updateCharacter = useUpdateCharacter();

  useEffect(() => {
    setDisplayName(character.name);
    setEditedName(character.name);
  }, [character.name]);

  const handleDeleteCharacter = async () => {
    if (confirm(t("confirmDelete"))) {
      try {
        if (onDelete) {
          await onDelete(character.id);
        }
        onClose();
      } catch (error) {
        console.error(t("deleteFailed"), error);
      }
    }
  };

  const handleSaveName = async () => {
    if (editedName.trim() === "") {
      alert(t("nameCannotBeEmpty"));
      return;
    }

    if (editedName.trim() === displayName) {
      setIsEditingName(false);
      return;
    }

    try {
      await updateCharacter.mutateAsync({
        characterId: character.id,
        updateData: { name: editedName.trim() },
      });

      setDisplayName(editedName.trim());
      setIsEditingName(false);
    } catch (error) {
      console.error(t("updateNameFailed"), error);
      alert(t("updateFailed"));
    }
  };

  const handleCancelEdit = () => {
    setEditedName(displayName);
    setIsEditingName(false);
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-accent/20 to-primary/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div
        className="bg-card/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl border border-border relative"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor:
            "oklch(0.65 0.15 340 / 0.3) oklch(0.96 0.03 340 / 0.1)",
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            width: 8px;
          }

          div::-webkit-scrollbar-track {
            background: oklch(0.96 0.03 340 / 0.1);
            border-radius: 10px;
          }

          div::-webkit-scrollbar-thumb {
            background: linear-gradient(
              to bottom,
              oklch(0.65 0.15 340 / 0.4),
              oklch(0.7 0.12 320 / 0.3)
            );
            border-radius: 10px;
            border: 1px solid oklch(0.65 0.15 340 / 0.1);
          }

          div::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(
              to bottom,
              oklch(0.65 0.15 340 / 0.6),
              oklch(0.7 0.12 320 / 0.5)
            );
          }
        `}</style>

        <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 rounded-3xl opacity-50 blur-xl -z-20 animate-pulse"></div>

        <div className="flex items-start justify-between mb-8 relative">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-xl border-4 border-card/80 relative">
                <Image
                  src={character.avatar_url}
                  alt={displayName}
                  className="w-full h-full object-cover"
                  width={160}
                  height={160}
                />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="text-3xl font-bold bg-card/80 backdrop-blur-sm rounded-xl px-4 py-2 border-2 border-primary/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-lg min-w-0 flex-1 text-foreground"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveName();
                        if (e.key === "Escape") handleCancelEdit();
                      }}
                      autoFocus
                      placeholder={t("enterCharacterName")}
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={updateCharacter.isPending}
                      className="p-1.5 hover:bg-chart-3/10 rounded-lg transition-all duration-300 text-chart-3 hover:scale-110 group backdrop-blur-sm border border-chart-3/20 disabled:opacity-50"
                      title={t("save")}
                    >
                      <Check className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={updateCharacter.isPending}
                      className="p-1.5 hover:bg-muted/50 rounded-lg transition-all duration-300 text-muted-foreground hover:scale-110 group backdrop-blur-sm border border-border disabled:opacity-50"
                      title={t("cancel")}
                    >
                      <XIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group">
                    <h3 className="text-3xl font-bold bg-primary bg-clip-text text-transparent">
                      {displayName}
                    </h3>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="p-1.5 hover:bg-primary/10 rounded-lg transition-all duration-300 text-primary hover:scale-110 group backdrop-blur-sm border border-primary/20 opacity-0 group-hover:opacity-100"
                      title={t("editName")}
                    >
                      <Edit3 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>
                    {t("createdOn")}{" "}
                    {new Date(character.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Hash className="w-4 h-4 text-accent" />
                  <span className="font-mono text-xs">
                    {character.id.slice(-8)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onDelete && (
              <button
                onClick={handleDeleteCharacter}
                className="p-3 hover:bg-destructive/10 rounded-2xl transition-all duration-300 text-destructive hover:scale-110 group backdrop-blur-sm border border-destructive/20"
                title={t("deleteCharacter")}
              >
                <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted/50 rounded-full transition-all duration-300 backdrop-blur-sm border border-border"
            >
              <X className="w-6 h-6 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="text-center flex items-center justify-center">
            <div className="relative inline-block group">
              <div className="relative">
                <Image
                  src={character.avatar_url}
                  alt={t("avatarAlt", { name: displayName })}
                  className="w-full max-w-sm mx-auto rounded-2xl shadow-2xl transition-all duration-500 group-hover:scale-105"
                  width={512}
                  height={512}
                />
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10"></div>
              </div>
            </div>
          </div>

          <div className="text-center group">
            <div className="relative inline-block">
              <div className="relative">
                <Image
                  src={character.three_view_url}
                  alt={t("threeViewAlt", { name: displayName })}
                  className="w-full max-w-sm mx-auto rounded-2xl shadow-2xl transition-all duration-500 group-hover:scale-105"
                  width={512}
                  height={512}
                />
                <div className="absolute -inset-4 bg-gradient-to-r from-accent/30 via-primary/20 to-accent/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-secondary/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-2xl"></div>

          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <h4 className="text-lg font-bold text-foreground">
                {t("creationTips")}
              </h4>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                <p>
                  <span className="font-semibold text-foreground">
                    {t("characterId")}
                  </span>
                  <span className="font-mono bg-muted px-2 py-1 rounded ml-2 shadow-sm text-foreground">
                    {character.id}
                  </span>
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 shrink-0"></div>
                <p>
                  <span className="font-semibold text-foreground">
                    {t("creationHint")}
                  </span>
                  {t("creationHint")}
                  <span className="font-bold text-primary bg-secondary px-2 py-1 rounded-lg mx-1 shadow-sm">
                    &quot;{displayName}&quot;
                  </span>
                  {t("toSpecifyActions")}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-chart-1 rounded-full mt-2 shrink-0"></div>
                <p>
                  <span className="font-semibold text-foreground">
                    {t("usageExample")}
                  </span>
                  {t("exampleText", { name: displayName })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
