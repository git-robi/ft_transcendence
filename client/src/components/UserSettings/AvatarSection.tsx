import { useState } from 'react';
import UserAvatar from '../UserAvatar';
import FileUploader from './FileUploader';
import { useLanguage } from '../../i18n/useLanguage';

export default function AvatarSection() {
  const { t } = useLanguage();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = () => {
    // Trigger UserAvatar to refetch by changing its key
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className='items-left gap-2 p-6'>
      <div className='py-0'>{t.avatarUpload.clickMessage}</div>
      <div className="flex flex-col rounded-lg items-start">
        {/* File uploader with avatar overlay */}
        <FileUploader 
          onUploadSuccess={handleUploadSuccess}
          avatarComponent={<UserAvatar key={refreshKey} />}
        />
      </div>
    </div>
  );
}
