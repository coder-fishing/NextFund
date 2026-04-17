import { ChangeEvent, useEffect, useMemo, useState } from "react";

type Args = {
  initialImageUrls?: string[];
  replaceExistingOnUpload?: boolean;
};

export function useCreateCampaignMedia({
  initialImageUrls = [],
  replaceExistingOnUpload = false,
}: Args = {}) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(initialImageUrls);

  const selectedFilePreviews = useMemo(
    () => selectedFiles.map((file) => URL.createObjectURL(file)),
    [selectedFiles]
  );

  const selectedImagePreviews = useMemo(
    () => [...existingImageUrls, ...selectedFilePreviews],
    [existingImageUrls, selectedFilePreviews]
  );

  useEffect(() => {
    return () => {
      selectedFilePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedFilePreviews]);

  const handleFilesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList) {
      return;
    }

    const incomingFiles = Array.from(fileList);

    if (replaceExistingOnUpload && incomingFiles.length > 0) {
      setExistingImageUrls([]);
      setSelectedFiles(incomingFiles);
      event.target.value = "";
      return;
    }

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
    setExistingImageUrls([]);
    setSelectedFiles([]);
  };

  return {
    selectedFiles,
    existingImageUrls,
    setExistingImageUrls,
    selectedImagePreviews,
    handleFilesChange,
    clearFiles,
  };
}
