"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Pencil, Trash2 } from "lucide-react";
import type { TopicCardViewModel } from "@/types/topics";

interface TopicCardProps {
  topic: TopicCardViewModel;
  onContinue: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TopicCard({ topic, onContinue, onEdit, onDelete }: TopicCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{topic.name}</CardTitle>
          <div className="flex shrink-0 gap-0.5">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onEdit(topic.id)}
              aria-label={`Edit ${topic.name}`}
            >
              <Pencil />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onDelete(topic.id)}
              aria-label={`Delete ${topic.name}`}
            >
              <Trash2 />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        {topic.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {topic.description}
          </p>
        )}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>
              {topic.solvedProblems}/{topic.totalProblems}
            </span>
          </div>
          <Progress value={topic.progressPercent} />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          size="sm"
          onClick={() => onContinue(topic.id)}
        >
          Continue
        </Button>
      </CardFooter>
    </Card>
  );
}
