import type { Category, ProviderInput, ProviderView } from "@/backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ExternalBlob } from "@caffeineai/object-storage";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ProviderFormProps {
  categories: Category[];
  provider?: ProviderView;
  isPending: boolean;
  onSubmit: (input: ProviderInput) => void;
  onCancel?: () => void;
  submitLabel: string;
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

export function ProviderForm({
  categories,
  provider,
  isPending,
  onSubmit,
  onCancel,
  submitLabel,
}: ProviderFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [photo, setPhoto] = useState<ExternalBlob | undefined>(undefined);
  const [photoName, setPhotoName] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize the draft once when the form opens for a given record.
  useEffect(() => {
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
  }, [provider]);

  const handlePhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploadProgress(0);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(
        bytes,
        file.type,
        file.name,
      ).withUploadProgress((pct) => setUploadProgress(pct));
      setPhoto(blob);
      setPhotoName(file.name);
    } catch {
      setError("Could not read that image. Please try another file.");
    } finally {
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = form.name.trim();
    const description = form.description.trim();
    const location = form.location.trim();
    const rate = Number.parseInt(form.hourlyRate, 10);

    if (!name) return setError("Enter your name or business name.");
    if (!form.categoryId) return setError("Choose a service category.");
    if (!description) return setError("Add a short description.");
    if (!Number.isFinite(rate) || rate < 0)
      return setError("Enter a valid hourly rate.");
    if (!location) return setError("Enter your service location.");

    setError(null);
    onSubmit({
      name,
      categoryId: BigInt(form.categoryId),
      description,
      hourlyRate: BigInt(rate),
      location,
      photo,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-2">
        <Label htmlFor="profile-name">Name</Label>
        <Input
          id="profile-name"
          value={form.name}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="e.g. Bright Nest Cleaning"
          data-ocid="my_profile.form.name_input"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="profile-category">Service category</Label>
        <Select
          value={form.categoryId}
          onValueChange={(value) =>
            setForm((prev) => ({ ...prev, categoryId: value }))
          }
        >
          <SelectTrigger
            id="profile-category"
            className="w-full"
            data-ocid="my_profile.form.category_select"
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
          <Label htmlFor="profile-rate">Hourly rate (USD)</Label>
          <Input
            id="profile-rate"
            type="number"
            min={0}
            inputMode="numeric"
            value={form.hourlyRate}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, hourlyRate: e.target.value }))
            }
            placeholder="45"
            data-ocid="my_profile.form.rate_input"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="profile-location">Location</Label>
          <Input
            id="profile-location"
            value={form.location}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, location: e.target.value }))
            }
            placeholder="e.g. Riverside, CA"
            data-ocid="my_profile.form.location_input"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="profile-description">Description</Label>
        <Textarea
          id="profile-description"
          rows={4}
          value={form.description}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Describe the services you offer and what makes you a trusted local provider."
          data-ocid="my_profile.form.description_textarea"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="profile-photo">Profile photo</Label>
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            id="profile-photo"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handlePhotoChange}
            data-ocid="my_profile.form.photo_input"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadProgress !== null}
            data-ocid="my_profile.form.upload_button"
          >
            {uploadProgress !== null ? (
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
                data-ocid="my_profile.form.remove_photo_button"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </div>
        {uploadProgress !== null ? (
          <div className="mt-1" data-ocid="my_profile.form.upload_progress">
            <Progress value={uploadProgress} className="h-2" />
            <p className="mt-1 text-xs text-muted-foreground">
              Preparing photo… {Math.round(uploadProgress)}%
            </p>
          </div>
        ) : null}
      </div>

      {error ? (
        <p
          className="text-sm text-destructive"
          data-ocid="my_profile.form.error_state"
        >
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          disabled={isPending || uploadProgress !== null}
          data-ocid="my_profile.form.submit_button"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 motion-safe:animate-spin" />
          ) : null}
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
            data-ocid="my_profile.form.cancel_button"
          >
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
