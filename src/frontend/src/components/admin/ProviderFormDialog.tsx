import type { Category, ProviderInput, ProviderView } from "@/backend";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateProvider, useUpdateProvider } from "@/hooks/useQueries";
import { ExternalBlob } from "@caffeineai/object-storage";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ProviderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  provider?: ProviderView;
}

interface FormState {
  name: string;
  categoryId: string;
  description: string;
  hourlyRate: string;
  location: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  categoryId: "",
  description: "",
  hourlyRate: "",
  location: "",
};

export function ProviderFormDialog({
  open,
  onOpenChange,
  categories,
  provider,
}: ProviderFormDialogProps) {
  const isEditing = provider !== undefined;
  const createProvider = useCreateProvider();
  const updateProvider = useUpdateProvider();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [photo, setPhoto] = useState<ExternalBlob | undefined>(undefined);
  const [photoName, setPhotoName] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the draft once when the dialog opens for a given record.
  useEffect(() => {
    if (!open) return;
    if (provider) {
      setForm({
        name: provider.name,
        categoryId: provider.categoryId.toString(),
        description: provider.description,
        hourlyRate: provider.hourlyRate.toString(),
        location: provider.location,
      });
      setPhoto(provider.photo);
      setPhotoName(provider.photo ? "Current photo" : "");
    } else {
      setForm(EMPTY_FORM);
      setPhoto(undefined);
      setPhotoName("");
    }
    setError(null);
  }, [open, provider]);

  const isPending = createProvider.isPending || updateProvider.isPending;

  const handlePhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes, file.type, file.name);
      setPhoto(blob);
      setPhotoName(file.name);
    } catch {
      setError("Could not read that image. Please try another file.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = form.name.trim();
    const description = form.description.trim();
    const location = form.location.trim();
    const rate = Number.parseInt(form.hourlyRate, 10);

    if (!name) return setError("Enter a provider name.");
    if (!form.categoryId) return setError("Choose a service category.");
    if (!description) return setError("Add a short description.");
    if (!Number.isFinite(rate) || rate < 0)
      return setError("Enter a valid hourly rate.");
    if (!location) return setError("Enter a service location.");

    const input: ProviderInput = {
      name,
      categoryId: BigInt(form.categoryId),
      description,
      hourlyRate: BigInt(rate),
      location,
      photo,
    };

    setError(null);
    if (isEditing && provider) {
      updateProvider.mutate(
        { id: provider.id, input },
        {
          onSuccess: () => {
            toast.success("Provider updated");
            onOpenChange(false);
          },
          onError: () => setError("Could not save changes. Please try again."),
        },
      );
    } else {
      createProvider.mutate(input, {
        onSuccess: () => {
          toast.success("Provider added");
          onOpenChange(false);
        },
        onError: () => setError("Could not add provider. Please try again."),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-xl"
        data-ocid="admin.provider_form.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {isEditing ? "Edit provider" : "Add provider"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this provider's public profile details."
              : "Create a new provider profile for the directory."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="provider-name">Name</Label>
            <Input
              id="provider-name"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g. Bright Nest Cleaning"
              data-ocid="admin.provider_form.name_input"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="provider-category">Category</Label>
            <Select
              value={form.categoryId}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, categoryId: value }))
              }
            >
              <SelectTrigger
                id="provider-category"
                className="w-full"
                data-ocid="admin.provider_form.category_select"
              >
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem
                    key={category.id.toString()}
                    value={category.id.toString()}
                  >
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="provider-rate">Hourly rate (USD)</Label>
              <Input
                id="provider-rate"
                type="number"
                min={0}
                inputMode="numeric"
                value={form.hourlyRate}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, hourlyRate: e.target.value }))
                }
                placeholder="45"
                data-ocid="admin.provider_form.rate_input"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="provider-location">Location</Label>
              <Input
                id="provider-location"
                value={form.location}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, location: e.target.value }))
                }
                placeholder="e.g. Riverside, CA"
                data-ocid="admin.provider_form.location_input"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="provider-description">Description</Label>
            <Textarea
              id="provider-description"
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Describe the services offered and what makes this provider trustworthy."
              data-ocid="admin.provider_form.description_textarea"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="provider-photo">Photo</Label>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                id="provider-photo"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handlePhotoChange}
                data-ocid="admin.provider_form.photo_input"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                data-ocid="admin.provider_form.upload_button"
              >
                {uploading ? (
                  <Loader2 className="mr-2 h-4 w-4 motion-safe:animate-spin" />
                ) : (
                  <ImagePlus className="mr-2 h-4 w-4" />
                )}
                {photo ? "Replace photo" : "Upload photo"}
              </Button>
              {photo ? (
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate text-sm text-muted-foreground">
                    {photoName}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remove photo"
                    onClick={() => {
                      setPhoto(undefined);
                      setPhotoName("");
                    }}
                    data-ocid="admin.provider_form.remove_photo_button"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : null}
            </div>
          </div>

          {error ? (
            <p
              className="text-sm text-destructive"
              data-ocid="admin.provider_form.error_state"
            >
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-ocid="admin.provider_form.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || uploading}
              data-ocid="admin.provider_form.submit_button"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 motion-safe:animate-spin" />
              ) : null}
              {isEditing ? "Save changes" : "Add provider"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
