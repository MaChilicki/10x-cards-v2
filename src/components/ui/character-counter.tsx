export interface CharacterCounterProps {
  count: number;
  min: number;
  max: number;
}

export function CharacterCounter({ count, min, max }: CharacterCounterProps) {
  const isUnderMin = count < min;
  const isOverMax = count > max;
  const getStatusColor = () => {
    if (isUnderMin || isOverMax) return "text-destructive";
    if (count >= min && count <= max) return "text-green-600";
    return "text-muted-foreground";
  };

  return (
    <div className="flex items-center justify-end space-x-2 text-sm">
      <span className={getStatusColor()}>{count.toLocaleString()} znaków</span>
      <span className="text-muted-foreground">
        (min: {min.toLocaleString()}, max: {max.toLocaleString()})
      </span>
    </div>
  );
}
