import type { Category } from "@/backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/hooks/useQueries";
import { Check, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function CategoryManager({ categories }: { categories: Category[] }) {
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAdd = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = newName.trim();
    if (!name) {
      setError("Enter a category name.");
      return;
    }
    setError(null);
    setNewName("");
    createCategory.mutate(name, {
      onSuccess: () => toast.success("Category added"),
      onError: () => {
        setError("Could not add category. Please try again.");
        setNewName((current) => (current === "" ? name : current));
      },
    });
  };

  const startEditing = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
    setError(null);
  };

  const handleSaveEdit = (id: bigint) => {
    const name = editingName.trim();
    if (!name) {
      setError("Category name cannot be empty.");
      return;
    }
    setError(null);
    updateCategory.mutate(
      { id, name },
      {
        onSuccess: () => {
          toast.success("Category updated");
          setEditingId(null);
        },
        onError: () => setError("Could not update category. Please try again."),
      },
    );
  };

  const handleDelete = (category: Category) => {
    setError(null);
    deleteCategory.mutate(category.id, {
      onSuccess: () => toast.success("Category removed"),
      onError: () => setError("Could not remove category. Please try again."),
    });
  };

  return (
    <div className="grid gap-6" data-ocid="admin.categories.panel">
      <form
        onSubmit={handleAdd}
        className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-subtle sm:flex-row sm:items-end"
      >
        <div className="grid flex-1 gap-2">
          <Label htmlFor="new-category">New category</Label>
          <Input
            id="new-category"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Gardening & Landscaping"
            data-ocid="admin.categories.name_input"
          />
        </div>
        <Button
          type="submit"
          disabled={createCategory.isPending}
          data-ocid="admin.categories.add_button"
        >
          {createCategory.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 motion-safe:animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Add category
        </Button>
      </form>

      {error ? (
        <p
          className="text-sm text-destructive"
          data-ocid="admin.categories.error_state"
        >
          {error}
        </p>
      ) : null}

      {categories.length === 0 ? (
        <div
          className="rounded-xl border border-dashed border-border bg-muted/40 p-10 text-center"
          data-ocid="admin.categories.empty_state"
        >
          <p className="font-display text-lg font-semibold text-foreground">
            No categories yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your first service category to organize the directory.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3" data-ocid="admin.categories.list">
          {categories.map((category, index) => {
            const isEditing = editingId === category.id;
            return (
              <li
                key={category.id.toString()}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-subtle"
                data-ocid={`admin.categories.item.${index + 1}`}
              >
                {isEditing ? (
                  <>
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      aria-label="Category name"
                      className="flex-1"
                      data-ocid={`admin.categories.edit_input.${index + 1}`}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label="Save category"
                      onClick={() => handleSaveEdit(category.id)}
                      disabled={updateCategory.isPending}
                      data-ocid={`admin.categories.save_button.${index + 1}`}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label="Cancel editing"
                      onClick={() => setEditingId(null)}
                      data-ocid={`admin.categories.cancel_button.${index + 1}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-medium text-foreground">
                      {category.name}
                    </span>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={`Edit ${category.name}`}
                      onClick={() => startEditing(category)}
                      data-ocid={`admin.categories.edit_button.${index + 1}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={`Remove ${category.name}`}
                      onClick={() => handleDelete(category)}
                      disabled={deleteCategory.isPending}
                      className="text-destructive hover:text-destructive"
                      data-ocid={`admin.categories.delete_button.${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
