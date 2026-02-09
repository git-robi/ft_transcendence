import {useState} from 'react';
import type {ChangeEvent} from 'react';
import Profile from "../../APIs/profile"
import { useLanguage } from '../../i18n/useLanguage';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export default function FileUploader({ onUploadSuccess, avatarComponent }: { onUploadSuccess?: () => void, avatarComponent?: React.ReactNode } = {}) {
    
    const { t } = useLanguage();
    const [status, setStatus] = useState<UploadStatus>('idle');
    const allowedTypes = ["image/png", "image/jpeg"];
    const [fileError, setFileError] = useState<string | null>(null);

    async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
      if (e.target.files) {
        const selected = e.target.files[0];
        if (!allowedTypes.includes(selected.type)) {
          setFileError("Only PNG and JPEG files are allowed");
          return;
        }
        setFileError(null);

        // auto upload immediately
        setStatus("uploading")

        const formData = new FormData();
        formData.append('avatar', selected);

        try {
          await Profile.patch("/upload", formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        setStatus('success');
        onUploadSuccess?.();
      } catch (error) {
        console.error('Upload failed:', error);
        setStatus('error');
        setFileError('Upload failed. Please try again.');
      }
    }
  }

  return (
    <div className='flex flex-col items-center gap-4'>

      {/* Avatar with camera overlay*/}
      <div className="relative group">
        <input 
          id="file-input"
          type="file"
          accept="image/png, image/jpeg"
          onChange={handleFileChange}
          className="hidden"
        />
        
        {avatarComponent && (
          <label htmlFor="file-input" className="cursor-pointer block">
            {avatarComponent}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
              <span className="text-4xl">📷</span>
            </div>
          </label>
        )}
      </div>

      {/* Status messages */}
      {status === 'uploading' && (
        <p className='text-gray-400'>{t.avatarUpload.uploading}</p>
      )}

      {status === 'success' && (
        <p className='text-green-500'>{t.avatarUpload.success}</p>
      )}

      {status === 'error' && (
        <p className='text-red-500'>{t.avatarUpload.error}</p>
      )}

      {fileError && (
        <p className='text-red-500'>{fileError}</p>
      )}

    </div>
  );
};