import { useState } from 'react';
import UserAvatar from '../UserAvatar';
import FileUploader from '../FileUploader';

export default function AvatarSection() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = () => {
    // Trigger UserAvatar to refetch by changing its key
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 rounded-lg">
      <h2 className="text-2xl font-semibold">Profile Avatar</h2>
      
      {/* File uploader with avatar overlay */}
      <FileUploader 
        onUploadSuccess={handleUploadSuccess}
        avatarComponent={<UserAvatar key={refreshKey} size={150} />}
      />
    </div>
  );
}
