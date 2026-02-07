import { useState } from 'react';
import UserAvatar from '../UserAvatar';
import FileUploader from '../FileUploader';
import { useLanguage } from '../../i18n/useLanguage';

export default function AvatarSection() {
  const { t } = useLanguage();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = () => {
    // Trigger UserAvatar to refetch by changing its key
    setRefreshKey(prev => prev + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
  }
  return (
    <div className='items-left gap-6 p-6'>
      <div>{t.avatarUpload.clickMessage}</div>
      <div className="flex flex-col  rounded-lg">
        
        
        {/* File uploader with avatar overlay */}
        <FileUploader 
          onUploadSuccess={handleUploadSuccess}
          avatarComponent={<UserAvatar key={refreshKey} />}
        />
        <form onSubmit={handleSubmit} className='space-y-4'></form>
        <div>Your Name</div>
      </div>
    </div>
  );
}
