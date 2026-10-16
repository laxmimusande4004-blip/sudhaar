
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  Upload,
  X,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import LocationPicker from "../components/LocationPicker";

const categories = [
  "Roads and potholes",
  "Waste and sanitation",
  "Water supply",
  "Drainage and flooding",
  "Streetlights",
  "Footpaths",
  "Public spaces",
  "Other",
];

const categoryValues = {
  "Roads and potholes": "roads",
  "Waste and sanitation": "sanitation",
  "Water supply": "water",
  "Drainage and flooding": "drainage",
  Streetlights: "streetlights",
  Footpaths: "footpaths",
  "Public spaces": "public_spaces",
  Other: "other",
};

export default function ReportIssuePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  const [location, setLocation] = useState(null);
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    address: "",
  });

  const [photo, setPhoto] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
      submit: "",
    }));
  }

  function handlePhoto(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrors((current) => ({
        ...current,
        photo: "Please choose a JPEG, PNG, or WebP image.",
      }));
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((current) => ({
        ...current,
        photo: "The image must be smaller than 5 MB.",
      }));
      event.target.value = "";
      return;
    }

    if (photo?.preview) {
      URL.revokeObjectURL(photo.preview);
    }

    setPhoto({
      file,
      preview: URL.createObjectURL(file),
    });

    setErrors((current) => ({
      ...current,
      photo: "",
      submit: "",
    }));
  }

  function removePhoto() {
    if (photo?.preview) {
      URL.revokeObjectURL(photo.preview);
    }

    setPhoto(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setErrors((current) => ({
      ...current,
      photo: "",
    }));
  }

  function validate() {
    const nextErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = "Enter a short title for the issue.";
    } else if (form.title.trim().length > 120) {
      nextErrors.title = "Keep the title under 120 characters.";
    }

    if (!form.category) {
      nextErrors.category = "Choose an issue category.";
    }

    if (!form.description.trim()) {
      nextErrors.description = "Describe what you observed.";
    } else if (form.description.trim().length < 20) {
      nextErrors.description =
        "Please add a little more detail (at least 20 characters).";
    } else if (form.description.trim().length > 2000) {
      nextErrors.description =
        "Keep the description under 2,000 characters.";
    }

    if (!form.address.trim()) {
      nextErrors.address = "Enter the location of the issue.";
    }

    if (
      !location ||
      !Number.isFinite(location.latitude) ||
      !Number.isFinite(location.longitude) ||
      location.latitude < -90 ||
      location.latitude > 90 ||
      location.longitude < -180 ||
      location.longitude > 180
    ) {
      nextErrors.location =
        "Click on the map to select a valid issue location.";
    }

    if (photo?.file) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(photo.file.type)) {
        nextErrors.photo = "Please choose a JPEG, PNG, or WebP image.";
      } else if (photo.file.size > 5 * 1024 * 1024) {
        nextErrors.photo = "The image must be smaller than 5 MB.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSuccess("");

    if (!validate()) return;

    if (!user) {
      setErrors({
        submit: "Please sign in before submitting a complaint.",
      });

      navigate("/login", {
        state: { from: { pathname: "/report" } },
      });

      return;
    }

    setSubmitting(true);
    setErrors({});

    let uploadedPhotoPath = null;

    try {
      // Upload the optional photo first.
      if (photo?.file) {
        const extensionByType = {
          "image/jpeg": "jpg",
          "image/png": "png",
          "image/webp": "webp",
        };

        const extension = extensionByType[photo.file.type];

        if (!extension) {
          throw new Error("Please upload a JPEG, PNG, or WebP image.");
        }

        uploadedPhotoPath =
          `${user.id}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("complaint-photos")
          .upload(uploadedPhotoPath, photo.file, {
            cacheControl: "3600",
            upsert: false,
            contentType: photo.file.type,
          });

        if (uploadError) {
          throw new Error(`Photo upload failed: ${uploadError.message}`);
        }
      }

      // Save the complaint, including the selected map coordinates.
      const { error: insertError } = await supabase
        .from("complaints")
        .insert({
          reporter_id: user.id,
          title: form.title.trim(),
          category: categoryValues[form.category],
          description: form.description.trim(),
          address: form.address.trim(),
          latitude: location.latitude,
          longitude: location.longitude,
          photo_path: uploadedPhotoPath,
          status: "submitted",
        });

      if (insertError) {
        throw new Error(insertError.message);
      }

      setSuccess(
        "Your complaint has been submitted successfully. Thank you for helping improve your community."
      );

      setForm({
        title: "",
        category: "",
        description: "",
        address: "",
      });

      setLocation(null);

      if (photo?.preview) {
        URL.revokeObjectURL(photo.preview);
      }

      setPhoto(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Clear any previous validation errors after a successful submission.
      setErrors({});
    } catch (error) {
      console.error("Complaint submission failed:", error);

      // Remove the uploaded photo if the database insert failed.
      if (uploadedPhotoPath) {
        const { error: cleanupError } = await supabase.storage
          .from("complaint-photos")
          .remove([uploadedPhotoPath]);

        if (cleanupError) {
          console.error(
            "Could not clean up uploaded photo:",
            cleanupError.message
          );
        }
      }

      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F6F0] text-[#21382B]">
      <Navbar />

      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-[#58675C] hover:text-[#245B43]"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <div className="mt-8 border-b border-[#DADDD3] pb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#55715B]">
            Community report
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Report a civic issue
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-6 text-[#667267] sm:text-base">
            Tell us what's wrong and where it is. Include enough detail for
            someone else to understand the problem.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-7" noValidate>
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-[#294536]"
            >
              What is the issue? <span className="text-red-700">*</span>
            </label>

            <input
              id="title"
              name="title"
              value={form.title}
              onChange={updateField}
              maxLength={120}
              placeholder="e.g. Large pothole near the bus stop"
              className="mt-2 w-full rounded-lg border border-[#D5D9CF] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#557F61] focus:ring-2 focus:ring-[#DCE9DA]"
              aria-invalid={Boolean(errors.title)}
            />

            <div className="mt-1 flex justify-between gap-3">
              {errors.title ? (
                <p className="text-xs text-red-700">{errors.title}</p>
              ) : (
                <span />
              )}

              <span className="text-xs text-[#899087]">
                {form.title.length}/120
              </span>
            </div>
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-semibold text-[#294536]"
            >
              Category <span className="text-red-700">*</span>
            </label>

            <select
              id="category"
              name="category"
              value={form.category}
              onChange={updateField}
              className="mt-2 w-full rounded-lg border border-[#D5D9CF] bg-white px-4 py-3 text-sm outline-none focus:border-[#557F61] focus:ring-2 focus:ring-[#DCE9DA]"
              aria-invalid={Boolean(errors.category)}
            >
              <option value="">Select a category</option>

              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {errors.category && (
              <p className="mt-1 text-xs text-red-700">
                {errors.category}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-[#294536]"
            >
              Describe the problem <span className="text-red-700">*</span>
            </label>

            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={updateField}
              rows={5}
              maxLength={2000}
              placeholder="What happened? Is it blocking a road or creating a safety concern? Add useful details."
              className="mt-2 w-full resize-y rounded-lg border border-[#D5D9CF] bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-[#557F61] focus:ring-2 focus:ring-[#DCE9DA]"
              aria-invalid={Boolean(errors.description)}
            />

            <div className="mt-1 flex justify-between gap-3">
              {errors.description ? (
                <p className="text-xs text-red-700">
                  {errors.description}
                </p>
              ) : (
                <span />
              )}

              <span className="text-xs text-[#899087]">
                {form.description.length}/2000
              </span>
            </div>
          </div>

          
          {/* Address search + interactive location picker */}
          <div>
            <label className="mb-3 block text-sm font-semibold text-[#294536]">
              Where is the issue? <span className="text-red-700">*</span>
            </label>

            <p className="mb-3 text-sm leading-6 text-[#667267]">
              Start typing an address, select the correct suggestion, and
              confirm the pin on the map.
            </p>

            <LocationPicker
              value={location}
              address={form.address}
              onAddressChange={(address) => {
                setForm((current) => ({
                  ...current,
                  address,
                }));

                setErrors((current) => ({
                  ...current,
                  address: "",
                  location: "",
                  submit: "",
                }));
              }}
              onChange={setLocation}
            />

            {errors.address && (
              <p className="mt-2 text-sm text-red-700">
                {errors.address}
              </p>
            )}

            {errors.location && (
              <p className="mt-2 text-sm text-red-700">
                {errors.location}
              </p>
            )}
          </div>


          {/* Photo upload */}
          <div>
            <label
              htmlFor="photo"
              className="block text-sm font-semibold text-[#294536]"
            >
              Add a photo{" "}
              <span className="font-normal text-[#899087]">(optional)</span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              onChange={handlePhoto}
              className="hidden"
              id="photo"
            />

            {photo ? (
              <div className="relative mt-3 w-fit max-w-full">
                <img
                  src={photo.preview}
                  alt="Preview of the selected complaint"
                  className="max-h-64 max-w-full rounded-lg border border-[#D5D9CF] object-contain"
                />

                <button
                  type="button"
                  onClick={removePhoto}
                  aria-label="Remove photo"
                  className="absolute right-2 top-2 rounded-full bg-white p-2 text-[#294536] shadow"
                >
                  <X size={16} />
                </button>

                <p className="mt-2 break-all text-xs text-[#687468]">
                  {photo.file.name}
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 flex min-h-28 w-full flex-col items-center justify-center rounded-lg border border-dashed border-[#C7CEC1] bg-white px-4 py-6 text-center transition hover:bg-[#F0F1E9]"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-[#365340]">
                  <Camera size={18} />
                  <Upload size={16} />
                  Choose a photo
                </span>

                <span className="mt-2 text-xs text-[#7C8578]">
                  JPEG, PNG, or WebP · Maximum 5 MB
                </span>
              </button>
            )}

            {errors.photo && (
              <p className="mt-2 text-xs text-red-700">
                {errors.photo}
              </p>
            )}
          </div>

          {/* Success message */}
          {success && (
            <div
              role="status"
              className="rounded-lg border border-[#B8D4B8] bg-[#EDF5E9] p-4 text-sm leading-6 text-[#245B43]"
            >
              {success}
            </div>
          )}

          {/* Submission error */}
          {errors.submit && (
            <div
              role="alert"
              className="rounded-lg border border-[#E3D3A8] bg-[#FBF4DF] p-4 text-sm leading-6 text-[#77561B]"
            >
              {errors.submit}
            </div>
          )}

          {/* Form actions */}
          <div className="border-t border-[#DADDD3] pt-5">
            <p className="text-xs leading-5 text-[#7C8578]">
              Please don't include sensitive personal information in your
              report. Only submit information relevant to the civic issue.
            </p>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="rounded-lg border border-[#D5D9CF] px-5 py-3 text-sm font-medium text-[#405648] hover:bg-[#EEEEE5]"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-[#245B43] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#194832] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit report"}
              </button>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
