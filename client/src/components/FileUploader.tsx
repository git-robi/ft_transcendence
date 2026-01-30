import {useState} from 'react';
import type {ChangeEvent} from 'react';
import Button from './Button.test';
import Profile from "../APIs/profile"

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export default function FileUploader(){
    
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<UploadStatus>('idle');
    
    function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    }

    async function handleFileUpload() {
        if (!file)
            return;

        setStatus("uploading");

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            await Profile.patch("/upload", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setStatus('success');
        } catch (error) {
            setStatus('error');
        }

    }

    return (
        <>
        <div>
            <input type="file" onChange={handleFileChange}/>
            {file && status != "uploading" &&  <Button onClick={handleFileUpload} text="Upload"/>}

            {status === 'success' && (
                <p>Upload successful</p>
            )}

            {status === 'error' && (
                <p>Upload failed</p>
            )}

        </div>
        </>
    )
}