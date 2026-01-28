import { useState, useMemo } from "react";
import { Button } from "./ui/button";
import { Plus, Settings, Trash2 } from "lucide-react";
import { WidgetType, WidgetPosition } from "@shared/widgetTypes";
import { trpc } from "@/lib/trpc";

interface WidgetGridProps {
  pageId: number;
  editable?: boolean;
}

interface WidgetInstance {
  id: number;
  type: WidgetType;
  position: WidgetPosition;
  config?: any;
}

export function WidgetGrid({ pageId, editable = false }: WidgetGridProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  const { data: widgets, isLoading, refetch } = trpc.widgets.list.useQuery({ pageId });
  const updateWidget = trpc.widgets.update.useMutation({
    onSuccess: () => refetch(),
  });
  const deleteWidget = trpc.widgets.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const parsedWidgets: WidgetInstance[] = useMemo(() => {
    if (!widgets) return [];
    return widgets.map((w) => ({
      id: w.id,
      type: w.type as WidgetType,
      position: JSON.parse(w.position),
      config: w.config ? JSON.parse(w.config) : undefined,
    }));
  }, [widgets]);

  const handleDeleteWidget = (widgetId: number) => {
    if (confirm("Are you sure you want to delete this widget?")) {
      deleteWidget.mutate({ widgetId });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      {editable && (
        <div className="mb-4 flex gap-2">
          <Button
            variant={isEditing ? "default" : "outline"}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Settings className="w-4 h-4 mr-2" />
            {isEditing ? "Done Editing" : "Edit Layout"}
          </Button>
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Widget
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {parsedWidgets.map((widget) => (
          <div
            key={widget.id}
            className="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative min-h-[200px]"
          >
            {isEditing && (
              <div className="absolute top-2 right-2 z-10">
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleDeleteWidget(widget.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            )}
            <WidgetRenderer widget={widget} />
          </div>
        ))}
      </div>
    </div>
  );
}

function WidgetRenderer({ widget }: { widget: WidgetInstance }) {
  // Placeholder widget renderer
  // Each widget type will have its own component
  return (
    <div className="h-full flex flex-col">
      <h3 className="font-semibold text-sm mb-2 capitalize">
        {widget.type.replace("-", " ")}
      </h3>
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        Widget content coming soon
      </div>
    </div>
  );
}
