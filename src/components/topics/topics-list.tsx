import type { TopicDto } from "@/types";
import { TopicCard } from "./topic-card";

interface TopicsListProps {
  topics: TopicDto[];
  onTopicClick: (topic: TopicDto) => void;
  onEditClick: (topic: TopicDto) => void;
  onDeleteClick: (topic: TopicDto) => void;
}

export function TopicsList({ topics, onTopicClick, onEditClick, onDeleteClick }: TopicsListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {topics.map((topic) => (
        <TopicCard
          key={topic.id}
          topic={topic}
          onTopicClick={onTopicClick}
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
        />
      ))}
    </div>
  );
}
