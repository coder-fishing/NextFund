import { ChangeEvent, useEffect, useMemo, useState } from "react";

export function useCreateCampaignMedia() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const selectedImagePreviews = useMemo(
    () => selectedFiles.map((file) => URL.createObjectURL(file)),
    [selectedFiles]
  );

  useEffect(() => {
    return () => {
      selectedImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedImagePreviews]);

  const handleFilesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList) {
      return;
    }

    const incomingFiles = Array.from(fileList);

    setSelectedFiles((prev) => {
      const fileKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;
      const existingKeys = new Set(prev.map(fileKey));
      const newUniqueFiles = incomingFiles.filter((file) => !existingKeys.has(fileKey(file)));
      return [...prev, ...newUniqueFiles];
    });

    // Allow picking the same file again after manual removal.
    event.target.value = "";
  };

  const clearFiles = () => {
    setSelectedFiles([]);
  };

  return {
    selectedFiles,
    selectedImagePreviews,
    handleFilesChange,
    clearFiles,
  };
}
